import { v4 as uuid } from "uuid";
import type { CreateDriver, UpdateDriver, Driver } from "@odoo-hackathon-26/shared";
import db from "../db/index";
import { DuplicateError } from "./errors";

const cols =
  "id, name, license_number AS licenseNumber, license_category AS licenseCategory, license_expiry AS licenseExpiry, contact_number AS contactNumber, safety_score AS safetyScore, status, created_at AS createdAt, updated_at AS updatedAt";

export const driverService = {
  list(): Driver[] {
    return db.query(`SELECT ${cols} FROM drivers ORDER BY created_at DESC`).all() as Driver[];
  },

  getById(id: string): Driver | undefined {
    return db.query(`SELECT ${cols} FROM drivers WHERE id = ?`).get(id) as Driver | undefined;
  },

  findByLicenseNumber(licenseNumber: string): Driver | undefined {
    return db.query(`SELECT ${cols} FROM drivers WHERE license_number = ?`).get(licenseNumber) as Driver | undefined;
  },

  create(data: CreateDriver): Driver {
    const id = uuid();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO drivers (id, name, license_number, license_category, license_expiry, contact_number, safety_score, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.licenseNumber, data.licenseCategory ?? null, data.licenseExpiry, data.contactNumber ?? null, data.safetyScore ?? 100, data.status, now, now],
    );

    return this.getById(id)!;
  },

  update(id: string, data: UpdateDriver): Driver | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();

    if (data.licenseNumber !== undefined && data.licenseNumber !== existing.licenseNumber) {
      const dup = this.findByLicenseNumber(data.licenseNumber);
      if (dup) return undefined;
      db.run("UPDATE drivers SET license_number = ?, updated_at = ? WHERE id = ?", [data.licenseNumber, now, id]);
    }

    if (data.name !== undefined) db.run("UPDATE drivers SET name = ?, updated_at = ? WHERE id = ?", [data.name, now, id]);
    if (data.licenseCategory !== undefined) db.run("UPDATE drivers SET license_category = ?, updated_at = ? WHERE id = ?", [data.licenseCategory ?? null, now, id]);
    if (data.licenseExpiry !== undefined) db.run("UPDATE drivers SET license_expiry = ?, updated_at = ? WHERE id = ?", [data.licenseExpiry, now, id]);
    if (data.contactNumber !== undefined) db.run("UPDATE drivers SET contact_number = ?, updated_at = ? WHERE id = ?", [data.contactNumber ?? null, now, id]);
    if (data.safetyScore !== undefined) db.run("UPDATE drivers SET safety_score = ?, updated_at = ? WHERE id = ?", [data.safetyScore, now, id]);
    if (data.status !== undefined) db.run("UPDATE drivers SET status = ?, updated_at = ? WHERE id = ?", [data.status, now, id]);

    return this.getById(id);
  },

  updateStatus(id: string, status: string): Driver | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    db.run("UPDATE drivers SET status = ?, updated_at = ? WHERE id = ?", [status, now, id]);

    return this.getById(id);
  },

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    db.run("DELETE FROM drivers WHERE id = ?", [id]);
    return true;
  },
};
