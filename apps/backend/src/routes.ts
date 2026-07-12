import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { CreateItemSchema, UpdateItemSchema } from "@odoo-hackathon-26/shared";
import db from "./db.js";

const router = Router();

function getId(req: Request): string {
  return req.params.id as string;
}

router.get("/items", (_req: Request, res: Response) => {
  const items = db.query("SELECT * FROM items ORDER BY created_at DESC").all();
  res.json(items);
});

router.get("/items/:id", (req: Request, res: Response) => {
  const id = getId(req);
  const item = db.query("SELECT * FROM items WHERE id = ?").get(id);

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(item);
});

router.post("/items", (req: Request, res: Response) => {
  const parsed = CreateItemSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const now = new Date().toISOString();
  const id = uuid();
  const { name, description } = parsed.data;

  db.run(
    "INSERT INTO items (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [id, name, description ?? null, now, now],
  );

  const item = db.query("SELECT * FROM items WHERE id = ?").get(id);
  res.status(201).json(item);
});

router.put("/items/:id", (req: Request, res: Response) => {
  const id = getId(req);
  const existing = db.query("SELECT * FROM items WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;

  if (!existing) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const parsed = UpdateItemSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const updates = parsed.data;
  const now = new Date().toISOString();

  if (Object.keys(updates).length === 0) {
    const item = db.query("SELECT * FROM items WHERE id = ?").get(id);
    res.json(item);
    return;
  }

  if (updates.name !== undefined) {
    db.run("UPDATE items SET name = ?, updated_at = ? WHERE id = ?", [
      updates.name,
      now,
      id,
    ]);
  }
  if (updates.description !== undefined) {
    db.run("UPDATE items SET description = ?, updated_at = ? WHERE id = ?", [
      updates.description,
      now,
      id,
    ]);
  }

  const item = db.query("SELECT * FROM items WHERE id = ?").get(id);
  res.json(item);
});

router.delete("/items/:id", (req: Request, res: Response) => {
  const id = getId(req);
  const existing = db.query("SELECT id FROM items WHERE id = ?").get(id);

  if (!existing) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  db.run("DELETE FROM items WHERE id = ?", [id]);
  res.status(204).send();
});

export default router;
