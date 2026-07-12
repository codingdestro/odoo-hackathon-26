import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { CreateMaintenanceLogSchema, UpdateMaintenanceLogSchema } from "@odoo-hackathon-26/shared";
import db from "../db";

const router = Router();

const table = "maintenance_logs";
const cols = "id, vehicle_id AS vehicleId, title, description, maintenance_cost AS maintenanceCost, start_date AS startDate, end_date AS endDate, status, created_at AS createdAt";

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
  const parsed = CreateMaintenanceLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const id = uuid();
  const d = parsed.data;
  db.run(
    `INSERT INTO ${table} (id, vehicle_id, title, description, maintenance_cost, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, d.vehicleId, d.title, d.description ?? null, d.maintenanceCost, d.startDate ?? null, d.endDate ?? null, d.status]
  );
  const row = db.query(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(id);
  res.status(201).json(row);
});

router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateMaintenanceLogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const d = parsed.data;
  const set = (col: string, val: unknown) => db.run(`UPDATE ${table} SET ${col} = ? WHERE id = ?`, [val, id]);

  if (d.vehicleId !== undefined) set("vehicle_id", d.vehicleId);
  if (d.title !== undefined) set("title", d.title);
  if (d.description !== undefined) set("description", d.description);
  if (d.maintenanceCost !== undefined) set("maintenance_cost", d.maintenanceCost);
  if (d.startDate !== undefined) set("start_date", d.startDate);
  if (d.endDate !== undefined) set("end_date", d.endDate);
  if (d.status !== undefined) set("status", d.status);

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
