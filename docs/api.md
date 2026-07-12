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

## Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/health` | No | `{ status: "ok" }` |

---

**Enums**: `VehicleStatus` (`AVAILABLE` | `ON_TRIP` | `IN_SHOP` | `RETIRED`), `DriverStatus` (`AVAILABLE` | `ON_TRIP` | `OFF_DUTY` | `SUSPENDED`), `TripStatus` (`DRAFT` | `DISPATCHED` | `COMPLETED` | `CANCELLED`).

All schemas defined in `@odoo-hackathon-26/shared`.
