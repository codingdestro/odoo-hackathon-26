import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { CreateExpenseSchema, UpdateExpenseSchema } from "@odoo-hackathon-26/shared";
import db from "../db";

const router = Router();

const table = "expenses";
const cols = "id, vehicle_id AS vehicleId, trip_id AS tripId, expense_type AS expenseType, amount, description, expense_date AS expenseDate, created_at AS createdAt";

router.get("/", (_req: Request, res: Response) => {
  const rows = db.query(`SELECT ${cols} FROM ${table} ORDER BY created_at DESC`).all();
  res.json(rows);
});

router.get("/:id", (req: Request, res: Response) => {
  const row = db.query(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(req.params.id as string);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/", (req: Request, res: Response) => {
  const parsed = CreateExpenseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const id = uuid();
  const d = parsed.data;
  db.run(
    `INSERT INTO ${table} (id, vehicle_id, trip_id, expense_type, amount, description, expense_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, d.vehicleId, d.tripId ?? null, d.expenseType, d.amount, d.description ?? null, d.expenseDate ?? null]
  );
  const row = db.query(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(id);
  res.status(201).json(row);
});

router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateExpenseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const d = parsed.data;
  const set = (col: string, val: any) => db.run(`UPDATE ${table} SET ${col} = ? WHERE id = ?`, [val, id]);

  if (d.vehicleId !== undefined) set("vehicle_id", d.vehicleId);
  if (d.tripId !== undefined) set("trip_id", d.tripId);
  if (d.expenseType !== undefined) set("expense_type", d.expenseType);
  if (d.amount !== undefined) set("amount", d.amount);
  if (d.description !== undefined) set("description", d.description);
  if (d.expenseDate !== undefined) set("expense_date", d.expenseDate);

  const row = db.query(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(id);
  res.json(row);
});

router.delete("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
  res.status(204).send();
});

export default router;
