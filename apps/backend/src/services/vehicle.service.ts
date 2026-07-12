import { v4 as uuid } from "uuid";
import type { CreateVehicle, UpdateVehicle, Vehicle } from "@odoo-hackathon-26/shared";
import db from "../db/index";

const cols =
  "id, registration_number AS registrationNumber, model, vehicle_type AS vehicleType, max_load_capacity AS maxLoadCapacity, odometer, acquisition_cost AS acquisitionCost, status, created_at AS createdAt, updated_at AS updatedAt";

export const vehicleService = {
  list(): Vehicle[] {
    return db.query(`SELECT ${cols} FROM vehicles ORDER BY created_at DESC`).all() as Vehicle[];
  },

  getById(id: string): Vehicle | undefined {
    return db.query(`SELECT ${cols} FROM vehicles WHERE id = ?`).get(id) as Vehicle | undefined;
  },

  findByRegistration(regNumber: string): Vehicle | undefined {
    return db.query(`SELECT ${cols} FROM vehicles WHERE registration_number = ?`).get(regNumber) as Vehicle | undefined;
  },

  create(data: CreateVehicle): Vehicle {
    const id = uuid();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO vehicles (id, registration_number, model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.registrationNumber, data.model, data.vehicleType, data.maxLoadCapacity, data.odometer ?? 0, data.acquisitionCost, data.status, now, now],
    );

    return this.getById(id)!;
  },

  update(id: string, data: UpdateVehicle): Vehicle | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();

    if (data.registrationNumber !== undefined && data.registrationNumber !== existing.registrationNumber) {
      if (this.findByRegistration(data.registrationNumber)) {
        throw new DuplicateError("Registration number already exists");
      }
      db.run("UPDATE vehicles SET registration_number = ?, updated_at = ? WHERE id = ?", [data.registrationNumber, now, id]);
    }

    if (data.model !== undefined) db.run("UPDATE vehicles SET model = ?, updated_at = ? WHERE id = ?", [data.model, now, id]);
    if (data.vehicleType !== undefined) db.run("UPDATE vehicles SET vehicle_type = ?, updated_at = ? WHERE id = ?", [data.vehicleType, now, id]);
    if (data.maxLoadCapacity !== undefined) db.run("UPDATE vehicles SET max_load_capacity = ?, updated_at = ? WHERE id = ?", [data.maxLoadCapacity, now, id]);
    if (data.odometer !== undefined) db.run("UPDATE vehicles SET odometer = ?, updated_at = ? WHERE id = ?", [data.odometer, now, id]);
    if (data.acquisitionCost !== undefined) db.run("UPDATE vehicles SET acquisition_cost = ?, updated_at = ? WHERE id = ?", [data.acquisitionCost, now, id]);
    if (data.status !== undefined) db.run("UPDATE vehicles SET status = ?, updated_at = ? WHERE id = ?", [data.status, now, id]);

    return this.getById(id);
  },

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    db.run("DELETE FROM vehicles WHERE id = ?", [id]);
    return true;
  },
};
