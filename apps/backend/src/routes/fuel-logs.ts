import { Router, Request, Response } from "express";
import { CreateFuelLogSchema, UpdateFuelLogSchema } from "@odoo-hackathon-26/shared";
import { authRequired } from "../util/auth";
import { fuelLogService } from "../services/fuel-log.service";

const router = Router();

router.use(authRequired);

// GET /api/fuel-logs
router.get("/", (_req: Request, res: Response) => {
  res.json(fuelLogService.list());
});

// GET /api/fuel-logs/:id
router.get("/:id", (req: Request, res: Response) => {
  const log = fuelLogService.getById(req.params.id as string);
  if (!log) {
    res.status(404).json({ error: "Fuel log not found" });
    return;
  }
  res.json(log);
});

// POST /api/fuel-logs
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateFuelLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const log = fuelLogService.create(parsed.data);
  res.status(201).json(log);
});

// PUT /api/fuel-logs/:id
router.put("/:id", (req: Request, res: Response) => {
  const parsed = UpdateFuelLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = fuelLogService.update(req.params.id as string, parsed.data);
  if (!result) {
    res.status(404).json({ error: "Fuel log not found" });
    return;
  }
  res.json(result);
});

// DELETE /api/fuel-logs/:id
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = fuelLogService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Fuel log not found" });
    return;
  }
  res.status(204).send();
});

export default router;
