import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────

export const VehicleStatus = z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]);
export type VehicleStatus = z.infer<typeof VehicleStatus>;

export const DriverStatus = z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]);
export type DriverStatus = z.infer<typeof DriverStatus>;

export const TripStatus = z.enum(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"]);
export type TripStatus = z.infer<typeof TripStatus>;

export const MaintenanceStatus = z.enum(["ACTIVE", "COMPLETED"]);
export type MaintenanceStatus = z.infer<typeof MaintenanceStatus>;

// ── Roles ────────────────────────────────────────────────────────────────────

export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});
export const CreateRoleSchema = RoleSchema.pick({ name: true });
export const UpdateRoleSchema = CreateRoleSchema.partial();
export type Role = z.infer<typeof RoleSchema>;
export type CreateRole = z.infer<typeof CreateRoleSchema>;
export type UpdateRole = z.infer<typeof UpdateRoleSchema>;

// ── Users ────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  roleId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  passwordHash: z.string().min(1),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const CreateUserSchema = z.object({
  roleId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
export const UpdateUserSchema = CreateUserSchema.pick({ name: true, email: true, roleId: true }).partial();
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// ── Vehicles ─────────────────────────────────────────────────────────────────

export const VehicleSchema = z.object({
  id: z.string().uuid(),
  registrationNumber: z.string().min(1),
  model: z.string().min(1),
  vehicleType: z.string().min(1),
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().min(0),
  acquisitionCost: z.number().positive(),
  status: VehicleStatus,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const CreateVehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  model: z.string().min(1),
  vehicleType: z.string().min(1),
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().min(0).default(0),
  acquisitionCost: z.number().positive(),
  status: VehicleStatus.default("AVAILABLE"),
});
export const UpdateVehicleSchema = CreateVehicleSchema.partial();
export type Vehicle = z.infer<typeof VehicleSchema>;
export type CreateVehicle = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>;

// ── Drivers ──────────────────────────────────────────────────────────────────

export const DriverSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().nullable().optional(),
  licenseExpiry: z.string(),
  contactNumber: z.string().nullable().optional(),
  safetyScore: z.number().min(0),
  status: DriverStatus,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const CreateDriverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().optional(),
  licenseExpiry: z.string(),
  contactNumber: z.string().optional(),
  safetyScore: z.number().min(0).default(100),
  status: DriverStatus.default("AVAILABLE"),
});
export const UpdateDriverSchema = CreateDriverSchema.partial();
export type Driver = z.infer<typeof DriverSchema>;
export type CreateDriver = z.infer<typeof CreateDriverSchema>;
export type UpdateDriver = z.infer<typeof UpdateDriverSchema>;

// ── Trips ────────────────────────────────────────────────────────────────────

export const TripSchema = z.object({
  id: z.string().uuid(),
  tripNumber: z.string().min(1),
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  source: z.string().min(1),
  destination: z.string().min(1),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  actualDistance: z.number().positive().nullable().optional(),
  startOdometer: z.number().min(0).nullable().optional(),
  endOdometer: z.number().min(0).nullable().optional(),
  fuelConsumed: z.number().min(0).nullable().optional(),
  revenue: z.number().min(0),
  status: TripStatus,
  dispatchedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
});
export const CreateTripSchema = z.object({
  tripNumber: z.string().min(1),
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  source: z.string().min(1),
  destination: z.string().min(1),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  actualDistance: z.number().positive().optional(),
  startOdometer: z.number().min(0).optional(),
  endOdometer: z.number().min(0).optional(),
  fuelConsumed: z.number().min(0).optional(),
  revenue: z.number().min(0).default(0),
  status: TripStatus.default("DRAFT"),
  dispatchedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});
export const UpdateTripSchema = CreateTripSchema.partial();
export type Trip = z.infer<typeof TripSchema>;
export type CreateTrip = z.infer<typeof CreateTripSchema>;
export type UpdateTrip = z.infer<typeof UpdateTripSchema>;

// ── Maintenance Logs ─────────────────────────────────────────────────────────

export const MaintenanceLogSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  maintenanceCost: z.number().min(0),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: MaintenanceStatus,
  createdAt: z.string().datetime(),
});
export const CreateMaintenanceLogSchema = z.object({
  vehicleId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  maintenanceCost: z.number().min(0).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: MaintenanceStatus.default("ACTIVE"),
});
export const UpdateMaintenanceLogSchema = CreateMaintenanceLogSchema.partial();
export type MaintenanceLog = z.infer<typeof MaintenanceLogSchema>;
export type CreateMaintenanceLog = z.infer<typeof CreateMaintenanceLogSchema>;
export type UpdateMaintenanceLog = z.infer<typeof UpdateMaintenanceLogSchema>;

// ── Fuel Logs ────────────────────────────────────────────────────────────────

export const FuelLogSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().nullable().optional(),
  liters: z.number().positive(),
  amount: z.number().positive(),
  fuelDate: z.string(),
  odometer: z.number().min(0).nullable().optional(),
  createdAt: z.string().datetime(),
});
export const CreateFuelLogSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().optional(),
  liters: z.number().positive(),
  amount: z.number().positive(),
  fuelDate: z.string(),
  odometer: z.number().min(0).optional(),
});
export const UpdateFuelLogSchema = CreateFuelLogSchema.partial();
export type FuelLog = z.infer<typeof FuelLogSchema>;
export type CreateFuelLog = z.infer<typeof CreateFuelLogSchema>;
export type UpdateFuelLog = z.infer<typeof UpdateFuelLogSchema>;

// ── Expenses ─────────────────────────────────────────────────────────────────

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().nullable().optional(),
  expenseType: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().nullable().optional(),
  expenseDate: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});
export const CreateExpenseSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().optional(),
  expenseType: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  expenseDate: z.string().optional(),
});
export const UpdateExpenseSchema = CreateExpenseSchema.partial();
export type Expense = z.infer<typeof ExpenseSchema>;
export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpense = z.infer<typeof UpdateExpenseSchema>;

// ── Items (legacy) ───────────────────────────────────────────────────────────

export const ItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const CreateItemSchema = ItemSchema.pick({ name: true, description: true });
export const UpdateItemSchema = CreateItemSchema.partial();
export type Item = z.infer<typeof ItemSchema>;
export type CreateItem = z.infer<typeof CreateItemSchema>;
export type UpdateItem = z.infer<typeof UpdateItemSchema>;
