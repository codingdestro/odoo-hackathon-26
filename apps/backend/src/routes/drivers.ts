import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import {
  CreateDriverSchema,
  DriverStatus,
  UpdateDriverSchema,
} from "@odoo-hackathon-26/shared";
import { authRequired } from "../util/auth.js";
import db from "../db/index.js";

const router = Router();

router.use(authRequired);

const cols =
  "id, name, license_number AS licenseNumber, license_category AS licenseCategory, license_expiry AS licenseExpiry, contact_number AS contactNumber, safety_score AS safetyScore, status, created_at AS createdAt, updated_at AS updatedAt";

// GET /api/drivers
router.get("/", (_req: Request, res: Response) => {
  const rows = db
    .query(`SELECT ${cols} FROM drivers ORDER BY created_at DESC`)
    .all();
  res.json(rows);
});

// GET /api/drivers/:id
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const row = db.query(`SELECT ${cols} FROM drivers WHERE id = ?`).get(id);
  if (!row) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json(row);
});

// POST /api/drivers
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const d = parsed.data;

  const duplicate = db
    .query("SELECT id FROM drivers WHERE license_number = ?")
    .get(d.licenseNumber);
  if (duplicate) {
    res.status(409).json({
      error: {
        fieldErrors: {
          licenseNumber: ["License number already exists"],
        },
      },
    });
    return;
  }

  const id = uuid();
  db.run(
    "INSERT INTO drivers (id, name, license_number, license_category, license_expiry, contact_number, safety_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      d.name,
      d.licenseNumber,
      d.licenseCategory ?? null,
      d.licenseExpiry,
      d.contactNumber ?? null,
      d.safetyScore ?? 100,
      d.status,
    ],
  );

  const row = db.query(`SELECT ${cols} FROM drivers WHERE id = ?`).get(id);
  res.status(201).json(row);
});

// PUT /api/drivers/:id
router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db
    .query(`SELECT ${cols} FROM drivers WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  const parsed = UpdateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const d = parsed.data;
  const now = new Date().toISOString();

  if (
    d.licenseNumber !== undefined &&
    d.licenseNumber !== existing.licenseNumber
  ) {
    const duplicate = db
      .query("SELECT id FROM drivers WHERE license_number = ? AND id != ?")
      .get(d.licenseNumber, id);
    if (duplicate) {
      res.status(409).json({
        error: {
          fieldErrors: {
            licenseNumber: ["License number already exists"],
          },
        },
      });
      return;
    }
  }

  if (d.name !== undefined)
    db.run("UPDATE drivers SET name = ?, updated_at = ? WHERE id = ?", [
      d.name,
      now,
      id,
    ]);
  if (d.licenseNumber !== undefined)
    db.run(
      "UPDATE drivers SET license_number = ?, updated_at = ? WHERE id = ?",
      [d.licenseNumber, now, id],
    );
  if (d.licenseCategory !== undefined)
    db.run(
      "UPDATE drivers SET license_category = ?, updated_at = ? WHERE id = ?",
      [d.licenseCategory ?? null, now, id],
    );
  if (d.licenseExpiry !== undefined)
    db.run(
      "UPDATE drivers SET license_expiry = ?, updated_at = ? WHERE id = ?",
      [d.licenseExpiry, now, id],
    );
  if (d.contactNumber !== undefined)
    db.run(
      "UPDATE drivers SET contact_number = ?, updated_at = ? WHERE id = ?",
      [d.contactNumber ?? null, now, id],
    );
  if (d.safetyScore !== undefined)
    db.run("UPDATE drivers SET safety_score = ?, updated_at = ? WHERE id = ?", [
      d.safetyScore,
      now,
      id,
    ]);
  if (d.status !== undefined)
    db.run("UPDATE drivers SET status = ?, updated_at = ? WHERE id = ?", [
      d.status,
      now,
      id,
    ]);

  const row = db.query(`SELECT ${cols} FROM drivers WHERE id = ?`).get(id);
  res.json(row);
});

// PUT /api/drivers/:id/status
router.put("/:id/status", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db
    .query(`SELECT ${cols} FROM drivers WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  const { status } = req.body as { status?: string };

  if (
    !status ||
    !Object.values(DriverStatus).includes(status as DriverStatus)
  ) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const now = new Date().toISOString();
  db.run("UPDATE drivers SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now,
    id,
  ]);

  const row = db.query(`SELECT ${cols} FROM drivers WHERE id = ?`).get(id);
  res.json(row);
});

// DELETE /api/drivers/:id
router.delete("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = db.query("SELECT id FROM drivers WHERE id = ?").get(id);
  if (!existing) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  db.run("DELETE FROM drivers WHERE id = ?", [id]);
  res.status(204).send();
});

export default router;
