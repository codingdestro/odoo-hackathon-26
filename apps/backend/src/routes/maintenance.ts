import { Router, Request, Response } from "express";
import { CreateMaintenanceLogSchema, UpdateMaintenanceLogSchema } from "@odoo-hackathon-26/shared";
import { authRequired } from "../util/auth";
import { maintenanceService } from "../services/maintenance.service";

const router = Router();

router.use(authRequired);

// GET /api/maintenance
router.get("/", (_req: Request, res: Response) => {
  res.json(maintenanceService.list());
});

// GET /api/maintenance/:id
router.get("/:id", (req: Request, res: Response) => {
  const log = maintenanceService.getById(req.params.id as string);
  if (!log) {
    res.status(404).json({ error: "Maintenance log not found" });
    return;
  }
  res.json(log);
});

// POST /api/maintenance
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateMaintenanceLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const log = maintenanceService.create(parsed.data);
    res.status(201).json(log);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

// PUT /api/maintenance/:id
router.put("/:id", (req: Request, res: Response) => {
  const parsed = UpdateMaintenanceLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = maintenanceService.update(req.params.id as string, parsed.data);
  if (!result) {
    res.status(404).json({ error: "Maintenance log not found" });
    return;
  }
  res.json(result);
});

// POST /api/maintenance/:id/complete
router.post("/:id/complete", (req: Request, res: Response) => {
  try {
    const { endDate } = req.body as { endDate?: string };
    const log = maintenanceService.complete(req.params.id as string, endDate);
    res.json(log);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /api/maintenance/:id
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = maintenanceService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Maintenance log not found" });
    return;
  }
  res.status(204).send();
});

export default router;
