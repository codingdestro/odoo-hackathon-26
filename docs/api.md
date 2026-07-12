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

## Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/health` | No | `{ status: "ok" }` |

---

**Enums**: `VehicleStatus` (`AVAILABLE` | `ON_TRIP` | `IN_SHOP` | `RETIRED`), `DriverStatus` (`AVAILABLE` | `ON_TRIP` | `OFF_DUTY` | `SUSPENDED`).

All schemas defined in `@odoo-hackathon-26/shared`.
