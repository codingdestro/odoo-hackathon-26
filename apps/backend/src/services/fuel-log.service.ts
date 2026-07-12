import { v4 as uuid } from "uuid";
import type { CreateFuelLog, UpdateFuelLog, FuelLog } from "@odoo-hackathon-26/shared";
import db from "../db/index";

const cols =
  "id, vehicle_id AS vehicleId, trip_id AS tripId, liters, amount, fuel_date AS fuelDate, odometer, created_at AS createdAt";

export const fuelLogService = {
  list(): FuelLog[] {
    return db.query(`SELECT ${cols} FROM fuel_logs ORDER BY created_at DESC`).all() as FuelLog[];
  },

  listByVehicle(vehicleId: string): FuelLog[] {
    return db.query(`SELECT ${cols} FROM fuel_logs WHERE vehicle_id = ? ORDER BY created_at DESC`).all(vehicleId) as FuelLog[];
  },

  getById(id: string): FuelLog | undefined {
    return db.query(`SELECT ${cols} FROM fuel_logs WHERE id = ?`).get(id) as FuelLog | undefined;
  },

  create(data: CreateFuelLog): FuelLog {
    const id = uuid();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO fuel_logs (id, vehicle_id, trip_id, liters, amount, fuel_date, odometer, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.vehicleId, data.tripId ?? null, data.liters, data.amount, data.fuelDate, data.odometer ?? null, now],
    );

    return this.getById(id)!;
  },

  update(id: string, data: UpdateFuelLog): FuelLog | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    if (data.vehicleId !== undefined) db.run("UPDATE fuel_logs SET vehicle_id = ? WHERE id = ?", [data.vehicleId, id]);
    if (data.tripId !== undefined) db.run("UPDATE fuel_logs SET trip_id = ? WHERE id = ?", [data.tripId ?? null, id]);
    if (data.liters !== undefined) db.run("UPDATE fuel_logs SET liters = ? WHERE id = ?", [data.liters, id]);
    if (data.amount !== undefined) db.run("UPDATE fuel_logs SET amount = ? WHERE id = ?", [data.amount, id]);
    if (data.fuelDate !== undefined) db.run("UPDATE fuel_logs SET fuel_date = ? WHERE id = ?", [data.fuelDate, id]);
    if (data.odometer !== undefined) db.run("UPDATE fuel_logs SET odometer = ? WHERE id = ?", [data.odometer ?? null, id]);

    return this.getById(id);
  },

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    db.run("DELETE FROM fuel_logs WHERE id = ?", [id]);
    return true;
  },
};
