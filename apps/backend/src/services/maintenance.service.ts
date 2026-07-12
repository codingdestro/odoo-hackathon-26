import { v4 as uuid } from "uuid";
import type {
  CreateMaintenanceLog,
  UpdateMaintenanceLog,
  MaintenanceLog,
  Vehicle,
} from "@odoo-hackathon-26/shared";
import db from "../db/index";

const cols =
  "id, vehicle_id AS vehicleId, title, description, maintenance_cost AS maintenanceCost, start_date AS startDate, end_date AS endDate, status, created_at AS createdAt";

export const maintenanceService = {
  list(): MaintenanceLog[] {
    return db
      .query(`SELECT ${cols} FROM maintenance_logs ORDER BY created_at DESC`)
      .all() as MaintenanceLog[];
  },

  listByVehicle(vehicleId: string): MaintenanceLog[] {
    return db
      .query(
        `SELECT ${cols} FROM maintenance_logs WHERE vehicle_id = ? ORDER BY created_at DESC`,
      )
      .all(vehicleId) as MaintenanceLog[];
  },

  getById(id: string): MaintenanceLog | undefined {
    return db
      .query(`SELECT ${cols} FROM maintenance_logs WHERE id = ?`)
      .get(id) as MaintenanceLog | undefined;
  },

  create(data: CreateMaintenanceLog): MaintenanceLog {
    const id = uuid();
    const now = new Date().toISOString();

    const vehicle = db
      .query(
        "SELECT id, registration_number AS registrationNumber, model, vehicle_type AS vehicleType, max_load_capacity AS maxLoadCapacity, odometer, acquisition_cost AS acquisitionCost, status, created_at AS createdAt, updated_at AS updatedAt FROM vehicles WHERE id = ?",
      )
      .get(data.vehicleId) as Vehicle | undefined;

    if (!vehicle) {
      const err = new Error("Vehicle not found");
      (err as any).status = 404;
      throw err;
    }
    if (vehicle.status === "ON_TRIP") {
      const err = new Error(
        `Vehicle "${vehicle.registrationNumber}" is on a trip and cannot enter maintenance`,
      );
      (err as any).status = 400;
      throw err;
    }
    if (vehicle.status === "RETIRED") {
      const err = new Error(
        `Vehicle "${vehicle.registrationNumber}" is retired`,
      );
      (err as any).status = 400;
      throw err;
    }

    const createFn = db.transaction(() => {
      db.run(
        `INSERT INTO maintenance_logs (id, vehicle_id, title, description, maintenance_cost, start_date, end_date, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.vehicleId,
          data.title,
          data.description ?? null,
          data.maintenanceCost ?? 0,
          data.startDate ?? null,
          data.endDate ?? null,
          data.status ?? "ACTIVE",
          now,
        ],
      );
      db.run(
        "UPDATE vehicles SET status = 'IN_SHOP', updated_at = ? WHERE id = ?",
        [now, data.vehicleId],
      );
    });

    createFn();

    return this.getById(id)!;
  },

  update(id: string, data: UpdateMaintenanceLog): MaintenanceLog | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();

    if (data.title !== undefined)
      db.run("UPDATE maintenance_logs SET title = ? WHERE id = ?", [
        data.title,
        id,
      ]);
    if (data.description !== undefined)
      db.run("UPDATE maintenance_logs SET description = ? WHERE id = ?", [
        data.description ?? null,
        id,
      ]);
    if (data.maintenanceCost !== undefined)
      db.run("UPDATE maintenance_logs SET maintenance_cost = ? WHERE id = ?", [
        data.maintenanceCost,
        id,
      ]);
    if (data.startDate !== undefined)
      db.run("UPDATE maintenance_logs SET start_date = ? WHERE id = ?", [
        data.startDate,
        id,
      ]);
    if (data.endDate !== undefined)
      db.run("UPDATE maintenance_logs SET end_date = ? WHERE id = ?", [
        data.endDate ?? null,
        id,
      ]);
    if (data.status !== undefined)
      db.run("UPDATE maintenance_logs SET status = ? WHERE id = ?", [
        data.status,
        id,
      ]);

    return this.getById(id);
  },

  complete(id: string, endDate?: string): MaintenanceLog {
    const log = this.getById(id);
    if (!log) {
      const err = new Error("Maintenance log not found");
      (err as any).status = 404;
      throw err;
    }
    if (log.status !== "ACTIVE") {
      const err = new Error("Only ACTIVE maintenance can be completed");
      (err as any).status = 400;
      throw err;
    }

    const now = new Date().toISOString();

    const completeFn = db.transaction(() => {
      db.run(
        "UPDATE maintenance_logs SET status = 'COMPLETED', end_date = ? WHERE id = ?",
        [endDate ?? now, id],
      );
      db.run(
        "UPDATE vehicles SET status = 'AVAILABLE', updated_at = ? WHERE id = ?",
        [now, log.vehicleId],
      );
    });

    completeFn();

    return this.getById(id)!;
  },

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    db.run("DELETE FROM maintenance_logs WHERE id = ?", [id]);
    return true;
  },
};
