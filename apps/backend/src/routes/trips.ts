import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { CreateTripSchema, UpdateTripSchema } from "@odoo-hackathon-26/shared";
import db from "../db";

const router = Router();

const table = "trips";
const cols = "id, trip_number AS tripNumber, vehicle_id AS vehicleId, driver_id AS driverId, source, destination, cargo_weight AS cargoWeight, planned_distance AS plannedDistance, actual_distance AS actualDistance, start_odometer AS startOdometer, end_odometer AS endOdometer, fuel_consumed AS fuelConsumed, revenue, status, dispatched_at AS dispatchedAt, completed_at AS completedAt, created_at AS createdAt";

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
  const parsed = CreateTripSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const id = uuid();
  const d = parsed.data;
  db.run(
    `INSERT INTO ${table} (id, trip_number, vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, actual_distance, start_odometer, end_odometer, fuel_consumed, revenue, status, dispatched_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, d.tripNumber, d.vehicleId, d.driverId, d.source, d.destination, d.cargoWeight, d.plannedDistance, d.actualDistance ?? null, d.startOdometer ?? null, d.endOdometer ?? null, d.fuelConsumed ?? null, d.revenue, d.status, d.dispatchedAt ?? null, d.completedAt ?? null]
  );
  const row = db.query(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(id);
  res.status(201).json(row);
});

router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const parsed = UpdateTripSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const d = parsed.data;
  const set = (col: string, val: unknown) => db.run(`UPDATE ${table} SET ${col} = ? WHERE id = ?`, [val, id]);

  if (d.tripNumber !== undefined) set("trip_number", d.tripNumber);
  if (d.vehicleId !== undefined) set("vehicle_id", d.vehicleId);
  if (d.driverId !== undefined) set("driver_id", d.driverId);
  if (d.source !== undefined) set("source", d.source);
  if (d.destination !== undefined) set("destination", d.destination);
  if (d.cargoWeight !== undefined) set("cargo_weight", d.cargoWeight);
  if (d.plannedDistance !== undefined) set("planned_distance", d.plannedDistance);
  if (d.actualDistance !== undefined) set("actual_distance", d.actualDistance);
  if (d.startOdometer !== undefined) set("start_odometer", d.startOdometer);
  if (d.endOdometer !== undefined) set("end_odometer", d.endOdometer);
  if (d.fuelConsumed !== undefined) set("fuel_consumed", d.fuelConsumed);
  if (d.revenue !== undefined) set("revenue", d.revenue);
  if (d.status !== undefined) set("status", d.status);
  if (d.dispatchedAt !== undefined) set("dispatched_at", d.dispatchedAt);
  if (d.completedAt !== undefined) set("completed_at", d.completedAt);

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
