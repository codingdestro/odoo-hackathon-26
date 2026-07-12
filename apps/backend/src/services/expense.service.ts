import { v4 as uuid } from "uuid";
import type { CreateExpense, UpdateExpense, Expense } from "@odoo-hackathon-26/shared";
import db from "../db/index";

const cols =
  "id, vehicle_id AS vehicleId, trip_id AS tripId, expense_type AS expenseType, amount, description, expense_date AS expenseDate, created_at AS createdAt";

interface CostSummary {
  vehicleId: string;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
}

export const expenseService = {
  list(): Expense[] {
    return db.query(`SELECT ${cols} FROM expenses ORDER BY created_at DESC`).all() as Expense[];
  },

  listByVehicle(vehicleId: string): Expense[] {
    return db.query(`SELECT ${cols} FROM expenses WHERE vehicle_id = ? ORDER BY created_at DESC`).all(vehicleId) as Expense[];
  },

  getById(id: string): Expense | undefined {
    return db.query(`SELECT ${cols} FROM expenses WHERE id = ?`).get(id) as Expense | undefined;
  },

  create(data: CreateExpense): Expense {
    const id = uuid();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO expenses (id, vehicle_id, trip_id, expense_type, amount, description, expense_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.vehicleId, data.tripId ?? null, data.expenseType, data.amount, data.description ?? null, data.expenseDate ?? null, now],
    );

    return this.getById(id)!;
  },

  update(id: string, data: UpdateExpense): Expense | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    if (data.vehicleId !== undefined) db.run("UPDATE expenses SET vehicle_id = ? WHERE id = ?", [data.vehicleId, id]);
    if (data.tripId !== undefined) db.run("UPDATE expenses SET trip_id = ? WHERE id = ?", [data.tripId ?? null, id]);
    if (data.expenseType !== undefined) db.run("UPDATE expenses SET expense_type = ? WHERE id = ?", [data.expenseType, id]);
    if (data.amount !== undefined) db.run("UPDATE expenses SET amount = ? WHERE id = ?", [data.amount, id]);
    if (data.description !== undefined) db.run("UPDATE expenses SET description = ? WHERE id = ?", [data.description ?? null, id]);
    if (data.expenseDate !== undefined) db.run("UPDATE expenses SET expense_date = ? WHERE id = ?", [data.expenseDate ?? null, id]);

    return this.getById(id);
  },

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    db.run("DELETE FROM expenses WHERE id = ?", [id]);
    return true;
  },

  getVehicleCostSummary(vehicleId: string): CostSummary {
    const fuelRow = db.query("SELECT COALESCE(SUM(amount), 0) as total FROM fuel_logs WHERE vehicle_id = ?").get(vehicleId) as { total: number };
    const maintRow = db.query("SELECT COALESCE(SUM(maintenance_cost), 0) as total FROM maintenance_logs WHERE vehicle_id = ?").get(vehicleId) as { total: number };
    const expenseRow = db.query("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE vehicle_id = ?").get(vehicleId) as { total: number };

    return {
      vehicleId,
      fuelCost: fuelRow.total,
      maintenanceCost: maintRow.total,
      otherExpenses: expenseRow.total,
      totalCost: fuelRow.total + maintRow.total + expenseRow.total,
    };
  },

  getAllCostSummaries(): (CostSummary & { registrationNumber: string })[] {
    const rows = db.query(
      "SELECT id, registration_number AS registrationNumber FROM vehicles ORDER BY registration_number"
    ).all() as { id: string; registrationNumber: string }[];

    return rows.map((v) => ({
      ...this.getVehicleCostSummary(v.id),
      registrationNumber: v.registrationNumber,
    }));
  },
};
