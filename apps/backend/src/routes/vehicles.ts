import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
} from "@odoo-hackathon-26/shared";
import { authRequired } from "../util/auth.js";
import db from "../db/index.js";

const router = Router();

router.use(authRequired);

const cols =
  "id, registration_number AS registrationNumber, model, vehicle_type AS vehicleType, max_load_capacity AS maxLoadCapacity, odometer, acquisition_cost AS acquisitionCost, status, created_at AS createdAt, updated_at AS updatedAt";

// GET /api/vehicles
router.get("/", (_req: Request, res: Response) => {
  const rows = db
    .query(`SELECT ${cols} FROM vehicles ORDER BY created_at DESC`)
    .all();
  res.json(rows);
});

// GET /api/vehicles/:id
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const row = db.query(`SELECT ${cols} FROM vehicles WHERE id = ?`).get(id);
  if (!row) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(row);
});

// POST /api/vehicles
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const d = parsed.data;

  const duplicate = db
    .query("SELECT id FROM vehicles WHERE registration_number = ?")
    .get(d.registrationNumber);
  if (duplicate) {
    res.status(409).json({
      error: {
        fieldErrors: {
          registrationNumber: ["Registration number already exists"],
        },
      },
    });
    return;
  }

  const id = uuid();
  db.run(
    "INSERT INTO vehicles (id, registration_number, model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      d.registrationNumber,
      d.model,
      d.vehicleType,
      d.maxLoadCapacity,
      d.odometer ?? 0,
      d.acquisitionCost,
      d.status,
    ],
  );

  const row = db.query(`SELECT ${cols} FROM vehicles WHERE id = ?`).get(id);
  res.status(201).json(row);
});

// PUT /api/vehicles/:id
router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db
    .query(`SELECT ${cols} FROM vehicles WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  const parsed = UpdateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const d = parsed.data;
  const now = new Date().toISOString();

  if (
    d.registrationNumber !== undefined &&
    d.registrationNumber !== existing.registrationNumber
  ) {
    const duplicate = db
      .query(
        "SELECT id FROM vehicles WHERE registration_number = ? AND id != ?",
      )
      .get(d.registrationNumber, id);
    if (duplicate) {
      res.status(409).json({
        error: {
          fieldErrors: {
            registrationNumber: ["Registration number already exists"],
          },
        },
      });
      return;
    }
  }

  if (d.registrationNumber !== undefined)
    db.run(
      "UPDATE vehicles SET registration_number = ?, updated_at = ? WHERE id = ?",
      [d.registrationNumber, now, id],
    );
  if (d.model !== undefined)
    db.run("UPDATE vehicles SET model = ?, updated_at = ? WHERE id = ?", [
      d.model,
      now,
      id,
    ]);
  if (d.vehicleType !== undefined)
    db.run(
      "UPDATE vehicles SET vehicle_type = ?, updated_at = ? WHERE id = ?",
      [d.vehicleType, now, id],
    );
  if (d.maxLoadCapacity !== undefined)
    db.run(
      "UPDATE vehicles SET max_load_capacity = ?, updated_at = ? WHERE id = ?",
      [d.maxLoadCapacity, now, id],
    );
  if (d.odometer !== undefined)
    db.run("UPDATE vehicles SET odometer = ?, updated_at = ? WHERE id = ?", [
      d.odometer,
      now,
      id,
    ]);
  if (d.acquisitionCost !== undefined)
    db.run(
      "UPDATE vehicles SET acquisition_cost = ?, updated_at = ? WHERE id = ?",
      [d.acquisitionCost, now, id],
    );
  if (d.status !== undefined)
    db.run("UPDATE vehicles SET status = ?, updated_at = ? WHERE id = ?", [
      d.status,
      now,
      id,
    ]);

  const row = db.query(`SELECT ${cols} FROM vehicles WHERE id = ?`).get(id);
  res.json(row);
});

// DELETE /api/vehicles/:id
router.delete("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query("SELECT id FROM vehicles WHERE id = ?").get(id);
  if (!existing) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  db.run("DELETE FROM vehicles WHERE id = ?", [id]);
  res.status(204).send();
});

export default router;
