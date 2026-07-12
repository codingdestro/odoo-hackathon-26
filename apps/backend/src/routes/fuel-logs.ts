import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { CreateFuelLogSchema, UpdateFuelLogSchema } from "@odoo-hackathon-26/shared";
import db from "../db";

const router = Router();

const table = "fuel_logs";
const cols = "id, vehicle_id AS vehicleId, trip_id AS tripId, liters, amount, fuel_date AS fuelDate, odometer, created_at AS createdAt";

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
  const parsed = CreateFuelLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const id = uuid();
  const d = parsed.data;
  db.run(
    `INSERT INTO ${table} (id, vehicle_id, trip_id, liters, amount, fuel_date, odometer) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, d.vehicleId, d.tripId ?? null, d.liters, d.amount, d.fuelDate, d.odometer ?? null]
  );
  const row = db.query(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(id);
  res.status(201).json(row);
});

router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateFuelLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const d = parsed.data;
  const set = (col: string, val: any) => db.run(`UPDATE ${table} SET ${col} = ? WHERE id = ?`, [val, id]);

  if (d.vehicleId !== undefined) set("vehicle_id", d.vehicleId);
  if (d.tripId !== undefined) set("trip_id", d.tripId);
  if (d.liters !== undefined) set("liters", d.liters);
  if (d.amount !== undefined) set("amount", d.amount);
  if (d.fuelDate !== undefined) set("fuel_date", d.fuelDate);
  if (d.odometer !== undefined) set("odometer", d.odometer);

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
