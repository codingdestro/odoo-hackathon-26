import { v4 as uuid } from "uuid";
import type {
  CreateTrip,
  UpdateTrip,
  Trip,
  Vehicle,
  Driver,
} from "@odoo-hackathon-26/shared";
import db from "../db/index";
import { DuplicateError } from "./errors";

const cols =
  "id, trip_number AS tripNumber, vehicle_id AS vehicleId, driver_id AS driverId, source, destination, cargo_weight AS cargoWeight, planned_distance AS plannedDistance, actual_distance AS actualDistance, start_odometer AS startOdometer, end_odometer AS endOdometer, fuel_consumed AS fuelConsumed, revenue, status, dispatched_at AS dispatchedAt, completed_at AS completedAt, created_at AS createdAt";

export const tripService = {
  list(): Trip[] {
    return db
      .query(`SELECT ${cols} FROM trips ORDER BY created_at DESC`)
      .all() as Trip[];
  },

  getById(id: string): Trip | undefined {
    return db.query(`SELECT ${cols} FROM trips WHERE id = ?`).get(id) as
      | Trip
      | undefined;
  },

  findByTripNumber(tripNumber: string): Trip | undefined {
    return db
      .query(`SELECT ${cols} FROM trips WHERE trip_number = ?`)
      .get(tripNumber) as Trip | undefined;
  },

  generateTripNumber(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = (
      db
        .query("SELECT COUNT(*) as count FROM trips WHERE trip_number LIKE ?")
        .get(`TRIP-${today}-%`) as { count: number }
    ).count;
    return `TRIP-${today}-${String(count + 1).padStart(3, "0")}`;
  },

  create(data: CreateTrip): Trip {
    const id = uuid();
    const now = new Date().toISOString();
    const tripNumber = data.tripNumber || this.generateTripNumber();

    db.run(
      `INSERT INTO trips (id, trip_number, vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, actual_distance, start_odometer, end_odometer, fuel_consumed, revenue, status, dispatched_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tripNumber,
        data.vehicleId,
        data.driverId,
        data.source,
        data.destination,
        data.cargoWeight,
        data.plannedDistance,
        data.actualDistance ?? null,
        data.startOdometer ?? null,
        data.endOdometer ?? null,
        data.fuelConsumed ?? null,
        data.revenue ?? 0,
        data.status ?? "DRAFT",
        data.dispatchedAt ?? null,
        data.completedAt ?? null,
        now,
      ],
    );

    return this.getById(id)!;
  },

  update(id: string, data: UpdateTrip): Trip | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();

    if (data.tripNumber !== undefined)
      db.run("UPDATE trips SET trip_number = ? WHERE id = ?", [
        data.tripNumber,
        id,
      ]);
    if (data.vehicleId !== undefined)
      db.run("UPDATE trips SET vehicle_id = ? WHERE id = ?", [
        data.vehicleId,
        id,
      ]);
    if (data.driverId !== undefined)
      db.run("UPDATE trips SET driver_id = ? WHERE id = ?", [
        data.driverId,
        id,
      ]);
    if (data.source !== undefined)
      db.run("UPDATE trips SET source = ? WHERE id = ?", [data.source, id]);
    if (data.destination !== undefined)
      db.run("UPDATE trips SET destination = ? WHERE id = ?", [
        data.destination,
        id,
      ]);
    if (data.cargoWeight !== undefined)
      db.run("UPDATE trips SET cargo_weight = ? WHERE id = ?", [
        data.cargoWeight,
        id,
      ]);
    if (data.plannedDistance !== undefined)
      db.run("UPDATE trips SET planned_distance = ? WHERE id = ?", [
        data.plannedDistance,
        id,
      ]);
    if (data.actualDistance !== undefined)
      db.run("UPDATE trips SET actual_distance = ? WHERE id = ?", [
        data.actualDistance ?? null,
        id,
      ]);
    if (data.startOdometer !== undefined)
      db.run("UPDATE trips SET start_odometer = ? WHERE id = ?", [
        data.startOdometer ?? null,
        id,
      ]);
    if (data.endOdometer !== undefined)
      db.run("UPDATE trips SET end_odometer = ? WHERE id = ?", [
        data.endOdometer ?? null,
        id,
      ]);
    if (data.fuelConsumed !== undefined)
      db.run("UPDATE trips SET fuel_consumed = ? WHERE id = ?", [
        data.fuelConsumed ?? null,
        id,
      ]);
    if (data.revenue !== undefined)
      db.run("UPDATE trips SET revenue = ? WHERE id = ?", [data.revenue, id]);
    if (data.status !== undefined)
      db.run("UPDATE trips SET status = ? WHERE id = ?", [data.status, id]);
    if (data.dispatchedAt !== undefined)
      db.run("UPDATE trips SET dispatched_at = ? WHERE id = ?", [
        data.dispatchedAt ?? null,
        id,
      ]);
    if (data.completedAt !== undefined)
      db.run("UPDATE trips SET completed_at = ? WHERE id = ?", [
        data.completedAt ?? null,
        id,
      ]);

    return this.getById(id);
  },

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    db.run("DELETE FROM trips WHERE id = ?", [id]);
    return true;
  },

  validateForDispatch(tripId: string): {
    vehicle: Vehicle;
    driver: Driver;
    trip: Trip;
  } {
    const trip = this.getById(tripId);
    if (!trip) {
      const err = new Error("Trip not found");
      (err as any).status = 404;
      throw err;
    }
    if (trip.status !== "DRAFT") {
      const err = new Error("Only DRAFT trips can be dispatched");
      (err as any).status = 400;
      throw err;
    }

    const vehicle = db
      .query(
        "SELECT id, registration_number AS registrationNumber, model, vehicle_type AS vehicleType, max_load_capacity AS maxLoadCapacity, odometer, acquisition_cost AS acquisitionCost, status, created_at AS createdAt, updated_at AS updatedAt FROM vehicles WHERE id = ?",
      )
      .get(trip.vehicleId) as Vehicle | undefined;
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      (err as any).status = 404;
      throw err;
    }
    if (vehicle.status !== "AVAILABLE") {
      const err = new Error(
        `Vehicle "${vehicle.registrationNumber}" is not available (status: ${vehicle.status})`,
      );
      (err as any).status = 400;
      throw err;
    }

    const driver = db
      .query(
        "SELECT id, name, license_number AS licenseNumber, license_category AS licenseCategory, license_expiry AS licenseExpiry, contact_number AS contactNumber, safety_score AS safetyScore, status, created_at AS createdAt, updated_at AS updatedAt FROM drivers WHERE id = ?",
      )
      .get(trip.driverId) as Driver | undefined;
    if (!driver) {
      const err = new Error("Driver not found");
      (err as any).status = 404;
      throw err;
    }
    if (driver.status === "SUSPENDED") {
      const err = new Error(`Driver "${driver.name}" is suspended`);
      (err as any).status = 400;
      throw err;
    }
    if (driver.status === "ON_TRIP") {
      const err = new Error(`Driver "${driver.name}" is already on a trip`);
      (err as any).status = 400;
      throw err;
    }
    if (new Date(driver.licenseExpiry) < new Date()) {
      const err = new Error(`Driver "${driver.name}" license has expired`);
      (err as any).status = 400;
      throw err;
    }

    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      const err = new Error(
        `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`,
      );
      (err as any).status = 400;
      throw err;
    }

    return { vehicle, driver, trip };
  },

  dispatch(tripId: string): Trip {
    const validation = this.validateForDispatch(tripId);

    const now = new Date().toISOString();

    const dispatchFn = db.transaction(() => {
      db.run(
        "UPDATE trips SET status = 'DISPATCHED', dispatched_at = ? WHERE id = ?",
        [now, tripId],
      );
      db.run(
        "UPDATE vehicles SET status = 'ON_TRIP', updated_at = ? WHERE id = ?",
        [now, validation.vehicle.id],
      );
      db.run(
        "UPDATE drivers SET status = 'ON_TRIP', updated_at = ? WHERE id = ?",
        [now, validation.driver.id],
      );
    });

    dispatchFn();

    return this.getById(tripId)!;
  },

  complete(tripId: string, finalOdometer?: number, fuelConsumed?: number): Trip {
    const trip = this.getById(tripId);
    if (!trip) {
      const err = new Error("Trip not found");
      (err as any).status = 404;
      throw err;
    }
    if (trip.status !== "DISPATCHED") {
      const err = new Error("Only DISPATCHED trips can be completed");
      (err as any).status = 400;
      throw err;
    }

    const now = new Date().toISOString();

    const completeFn = db.transaction(() => {
      db.run(
        "UPDATE trips SET status = 'COMPLETED', completed_at = ?, end_odometer = ?, fuel_consumed = ? WHERE id = ?",
        [now, finalOdometer ?? null, fuelConsumed ?? null, tripId],
      );
      db.run(
        "UPDATE vehicles SET status = 'AVAILABLE', updated_at = ? WHERE id = ?",
        [now, trip.vehicleId],
      );
      db.run(
        "UPDATE drivers SET status = 'AVAILABLE', updated_at = ? WHERE id = ?",
        [now, trip.driverId],
      );
    });

    completeFn();

    return this.getById(tripId)!;
  },

  cancel(tripId: string): Trip {
    const trip = this.getById(tripId);
    if (!trip) {
      const err = new Error("Trip not found");
      (err as any).status = 404;
      throw err;
    }
    if (trip.status !== "DRAFT" && trip.status !== "DISPATCHED") {
      const err = new Error("Only DRAFT or DISPATCHED trips can be cancelled");
      (err as any).status = 400;
      throw err;
    }

    const now = new Date().toISOString();

    const cancelFn = db.transaction(() => {
      db.run(
        "UPDATE trips SET status = 'CANCELLED' WHERE id = ?",
        [tripId],
      );
      db.run(
        "UPDATE vehicles SET status = 'AVAILABLE', updated_at = ? WHERE id = ?",
        [now, trip.vehicleId],
      );
      db.run(
        "UPDATE drivers SET status = 'AVAILABLE', updated_at = ? WHERE id = ?",
        [now, trip.driverId],
      );
    });

    cancelFn();

    return this.getById(tripId)!;
  },
};
