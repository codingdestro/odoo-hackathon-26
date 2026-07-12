# API Endpoints

Base URL: `http://localhost:3001/api`

All `*`-marked routes require `Authorization: Bearer <token>`.

---

## Auth

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `POST` | `/auth/signup` | No | `SignUpSchema` | `UserSchema` (201) |
| `POST` | `/auth/signin` | No | `SignInSchema` | `{ token, user: UserSchema }` |
| `POST` | `/auth/logout` | No | — | `{ message }` |
| `GET` | `/auth/me` | `*` | — | `UserSchema` |
| `GET` | `/auth/roles` | No | — | `[{ id, name }]` |

## Vehicles

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `GET` | `/vehicles` | `*` | — | `VehicleSchema[]` |
| `GET` | `/vehicles/:id` | `*` | — | `VehicleSchema` |
| `POST` | `/vehicles` | `*` | `CreateVehicleSchema` | `VehicleSchema` (201) |
| `PUT` | `/vehicles/:id` | `*` | `UpdateVehicleSchema` | `VehicleSchema` |
| `DELETE` | `/vehicles/:id` | `*` | — | 204 |

## Drivers

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `GET` | `/drivers` | `*` | — | `DriverSchema[]` |
| `GET` | `/drivers/:id` | `*` | — | `DriverSchema` |
| `POST` | `/drivers` | `*` | `CreateDriverSchema` | `DriverSchema` (201) |
| `PUT` | `/drivers/:id` | `*` | `UpdateDriverSchema` | `DriverSchema` |
| `PUT` | `/drivers/:id/status` | `*` | `{ status: DriverStatus }` | `DriverSchema` |
| `DELETE` | `/drivers/:id` | `*` | — | 204 |

## Trips

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `GET` | `/trips` | `*` | — | `TripSchema[]` |
| `GET` | `/trips/:id` | `*` | — | `TripSchema` |
| `POST` | `/trips` | `*` | `CreateTripSchema` | `TripSchema` (201) |
| `PUT` | `/trips/:id` | `*` | `UpdateTripSchema` | `TripSchema` |
| `POST` | `/trips/:id/dispatch` | `*` | — | `TripSchema` |
| `POST` | `/trips/:id/complete` | `*` | `{ endOdometer?, fuelConsumed? }` | `TripSchema` |
| `POST` | `/trips/:id/cancel` | `*` | — | `TripSchema` |
| `DELETE` | `/trips/:id` | `*` | — | 204 |

### Dispatch Rules

`POST /trips/:id/dispatch` enforces the following in a single database transaction:

1. **Trip must be in `DRAFT` status**
2. **Vehicle must be `AVAILABLE`** — rejects if `ON_TRIP`, `IN_SHOP`, or `RETIRED`
3. **Driver must not be `SUSPENDED` or `ON_TRIP`** — rejects if suspended or already on trip
4. **Driver license must not be expired**
5. **Cargo weight ≤ vehicle max load capacity** — rejects if overloaded

On success (all checks pass, single transaction):
- Trip → status = `DISPATCHED`, `dispatched_at` = now
- Vehicle → status = `ON_TRIP`
- Driver → status = `ON_TRIP`

If any update fails, the entire transaction rolls back.

### Complete Trip

`POST /trips/:id/complete` (single transaction):
- Trip must be `DISPATCHED`
- Optional body: `{ endOdometer, fuelConsumed }`
- Trip → status = `COMPLETED`, `completed_at` = now, final odometer/fuel saved
- Vehicle → status = `AVAILABLE`
- Driver → status = `AVAILABLE`

### Cancel Trip

`POST /trips/:id/cancel` (single transaction):
- Trip must be `DRAFT` or `DISPATCHED`
- Trip → status = `CANCELLED`
- Vehicle → status = `AVAILABLE`
- Driver → status = `AVAILABLE`

## Maintenance

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `GET` | `/maintenance` | `*` | — | `MaintenanceLogSchema[]` |
| `GET` | `/maintenance/:id` | `*` | — | `MaintenanceLogSchema` |
| `POST` | `/maintenance` | `*` | `CreateMaintenanceLogSchema` | `MaintenanceLogSchema` (201) |
| `PUT` | `/maintenance/:id` | `*` | `UpdateMaintenanceLogSchema` | `MaintenanceLogSchema` |
| `POST` | `/maintenance/:id/complete` | `*` | `{ endDate? }` | `MaintenanceLogSchema` |
| `DELETE` | `/maintenance/:id` | `*` | — | 204 |

### Maintenance Rules

`POST /maintenance` — creating a maintenance record (single transaction):
- Vehicle must exist
- Vehicle must not be `ON_TRIP` or `RETIRED`
- Maintenance log → created with `ACTIVE` status
- Vehicle → status = `IN_SHOP` (hidden from dispatch)

`POST /maintenance/:id/complete` (single transaction):
- Maintenance must be `ACTIVE`
- Optional body: `{ endDate }`
- Maintenance → status = `COMPLETED`, `end_date` = now
- Vehicle → status = `AVAILABLE`

## Fuel Logs

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `GET` | `/fuel-logs` | `*` | — | `FuelLogSchema[]` |
| `GET` | `/fuel-logs/:id` | `*` | — | `FuelLogSchema` |
| `POST` | `/fuel-logs` | `*` | `CreateFuelLogSchema` | `FuelLogSchema` (201) |
| `PUT` | `/fuel-logs/:id` | `*` | `UpdateFuelLogSchema` | `FuelLogSchema` |
| `DELETE` | `/fuel-logs/:id` | `*` | — | 204 |

## Expenses

| Method | Path | Auth | Body Schema | Response |
|--------|------|------|-------------|----------|
| `GET` | `/expenses` | `*` | — | `ExpenseSchema[]` |
| `GET` | `/expenses/summaries` | `*` | — | `[{ vehicleId, registrationNumber, fuelCost, maintenanceCost, otherExpenses, totalCost }]` |
| `GET` | `/expenses/:id` | `*` | — | `ExpenseSchema` |
| `POST` | `/expenses` | `*` | `CreateExpenseSchema` | `ExpenseSchema` (201) |
| `PUT` | `/expenses/:id` | `*` | `UpdateExpenseSchema` | `ExpenseSchema` |
| `DELETE` | `/expenses/:id` | `*` | — | 204 |

### Cost Summary

`GET /expenses/summaries` computes total operational cost per vehicle by summing:
- **Fuel cost** — from `fuel_logs` table
- **Maintenance cost** — from `maintenance_logs` table
- **Other expenses** — from `expenses` table
- **Total** — sum of all three

## Dashboard

| Method | Path | Auth | Query Params | Response |
|--------|------|------|-------------|----------|
| `GET` | `/dashboard` | `*` | `?vehicleType=&status=` | KPIs + recent trips |

Supports optional filters: `?vehicleType=Truck` and `?status=AVAILABLE`.

Returns:
```json
{
  "vehicles": { "total", "active", "available", "inShop", "onTrip", "retired", "byType": [...], "utilizationPercent" },
  "drivers": { "total", "available", "onDuty", "offDuty", "suspended" },
  "trips": { "total", "active", "pending", "completed", "cancelled" },
  "costs": { "totalFuel", "totalMaintenance", "totalExpenses" },
  "recentTrips": [{ "id", "tripNumber", "source", "destination", "vehicleReg", "driverName", "cargoWeight", "status", "createdAt" }]
}
```

## Reports

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/reports/analytics` | `*` | Fleet analytics JSON |
| `GET` | `/reports/export/csv` | `*` | CSV file download |

### `GET /reports/analytics`

Returns fleet-wide KPIs + per-vehicle report:

```json
{
  "utilizationPercent": 30,
  "totalRevenue": 500000,
  "totalFuelCost": 80000,
  "totalMaintenanceCost": 45000,
  "totalExpenses": 25000,
  "totalOperationalCost": 150000,
  "avgFuelEfficiency": 8.5,
  "vehicleReports": [{
    "registrationNumber", "model", "vehicleType", "status",
    "totalTrips", "totalDistance", "totalFuelConsumed",
    "fuelEfficiency", "totalRevenue", "maintenanceCost",
    "fuelCost", "otherExpenses", "operationalCost",
    "acquisitionCost", "roi"
  }]
}
```

**Computed metrics:**
- **Fuel Efficiency** = Total Distance / Total Fuel (km/L)
- **Operational Cost** = Maintenance + Fuel + Other Expenses
- **ROI** = (Revenue - Operational Cost) / Acquisition Cost

### `GET /reports/export/csv`

Downloads `fleet-report.csv` with all vehicle report columns + fleet summary rows.

## Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/health` | No | `{ status: "ok" }` |

---

**Enums**: `VehicleStatus` (`AVAILABLE` | `ON_TRIP` | `IN_SHOP` | `RETIRED`), `DriverStatus` (`AVAILABLE` | `ON_TRIP` | `OFF_DUTY` | `SUSPENDED`), `TripStatus` (`DRAFT` | `DISPATCHED` | `COMPLETED` | `CANCELLED`), `MaintenanceStatus` (`ACTIVE` | `COMPLETED`).

All schemas defined in `@odoo-hackathon-26/shared`.
