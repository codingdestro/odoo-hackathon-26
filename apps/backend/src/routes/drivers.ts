import { Router, Request, Response } from "express";
import {
  CreateDriverSchema,
  DriverStatus,
  UpdateDriverSchema,
} from "@odoo-hackathon-26/shared";
import { authRequired, authorize } from "../util/auth";
import { driverService } from "../services/driver.service";
import { DuplicateError } from "../services/errors";

const router = Router();

router.use(authRequired);
router.use(authorize("ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"));

// GET /api/drivers
router.get("/", (_req: Request, res: Response) => {
  res.json(driverService.list());
});

// GET /api/drivers/:id
router.get("/:id", (req: Request, res: Response) => {
  const driver = driverService.getById(req.params.id as string);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json(driver);
});

// POST /api/drivers
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (driverService.findByLicenseNumber(parsed.data.licenseNumber)) {
    res.status(409).json({
      error: { fieldErrors: { licenseNumber: ["License number already exists"] } },
    });
    return;
  }

  const driver = driverService.create(parsed.data);
  res.status(201).json(driver);
});

// PUT /api/drivers/:id
router.put("/:id", (req: Request, res: Response) => {
  const parsed = UpdateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = driverService.update(req.params.id as string, parsed.data);
    if (!result) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof DuplicateError) {
      res.status(409).json({
        error: { fieldErrors: { licenseNumber: [err.message] } },
      });
      return;
    }
    throw err;
  }
});

// PUT /api/drivers/:id/status
router.put("/:id/status", (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };

  if (!status || !Object.values(DriverStatus).includes(status as typeof DriverStatus._type)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const driver = driverService.updateStatus(req.params.id as string, status);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  res.json(driver);
});

// DELETE /api/drivers/:id
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = driverService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.status(204).send();
});

export default router;
