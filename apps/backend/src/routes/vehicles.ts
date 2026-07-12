import { Router, Request, Response } from "express";
import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
} from "@odoo-hackathon-26/shared";
import { authRequired, authorize } from "../util/auth";
import { vehicleService } from "../services/vehicle.service";
import { DuplicateError } from "../services/errors";

const router = Router();

router.use(authRequired);

const viewRoles = ["ADMIN", "FLEET_MANAGER", "DISPATCHER"];
const mutateRoles = ["ADMIN", "FLEET_MANAGER"];

// GET /api/vehicles
router.get("/", authorize(...viewRoles), (_req: Request, res: Response) => {
  res.json(vehicleService.list());
});

// GET /api/vehicles/:id
router.get("/:id", authorize(...viewRoles), (req: Request, res: Response) => {
  const vehicle = vehicleService.getById(req.params.id as string);
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
});

// POST /api/vehicles
router.post("/", authorize(...mutateRoles), (req: Request, res: Response) => {
  const parsed = CreateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (vehicleService.findByRegistration(parsed.data.registrationNumber)) {
    res.status(409).json({
      error: { fieldErrors: { registrationNumber: ["Registration number already exists"] } },
    });
    return;
  }

  const vehicle = vehicleService.create(parsed.data);
  res.status(201).json(vehicle);
});

// PUT /api/vehicles/:id
router.put("/:id", authorize(...mutateRoles), (req: Request, res: Response) => {
  const parsed = UpdateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = vehicleService.update(req.params.id as string, parsed.data);
    if (!result) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof DuplicateError) {
      res.status(409).json({
        error: { fieldErrors: { registrationNumber: [err.message] } },
      });
      return;
    }
    throw err;
  }
});

// DELETE /api/vehicles/:id
router.delete("/:id", authorize(...mutateRoles), (req: Request, res: Response) => {
  const deleted = vehicleService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.status(204).send();
});

export default router;
