import { Router, Request, Response } from "express";
import { CreateTripSchema, UpdateTripSchema } from "@odoo-hackathon-26/shared";
import { authRequired, authorize } from "../util/auth";
import { tripService } from "../services/trip.service";

const router = Router();

router.use(authRequired);

const viewRoles = ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"];
const mutateRoles = ["ADMIN", "FLEET_MANAGER", "DISPATCHER"];

// GET /api/trips
router.get("/", authorize(...viewRoles), (_req: Request, res: Response) => {
  res.json(tripService.list());
});

// GET /api/trips/:id
router.get("/:id", authorize(...viewRoles), (req: Request, res: Response) => {
  const trip = tripService.getById(req.params.id as string);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(trip);
});

// POST /api/trips
router.post("/", authorize(...mutateRoles), (req: Request, res: Response) => {
  const parsed = CreateTripSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const trip = tripService.create(parsed.data);
  res.status(201).json(trip);
});

// PUT /api/trips/:id
router.put("/:id", authorize(...mutateRoles), (req: Request, res: Response) => {
  const parsed = UpdateTripSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = tripService.update(req.params.id as string, parsed.data);
  if (!result) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(result);
});

// POST /api/trips/:id/dispatch
router.post("/:id/dispatch", authorize(...mutateRoles), (req: Request, res: Response) => {
  try {
    const trip = tripService.dispatch(req.params.id as string);
    res.json(trip);
  } catch (err) {
    throw err;
  }
});

// POST /api/trips/:id/complete
router.post("/:id/complete", authorize(...mutateRoles), (req: Request, res: Response) => {
  try {
    const { endOdometer, fuelConsumed } = req.body as { endOdometer?: number; fuelConsumed?: number };
    const trip = tripService.complete(req.params.id as string, endOdometer, fuelConsumed);
    res.json(trip);
  } catch (err) {
    throw err;
  }
});

// POST /api/trips/:id/cancel
router.post("/:id/cancel", authorize(...mutateRoles), (req: Request, res: Response) => {
  try {
    const trip = tripService.cancel(req.params.id as string);
    res.json(trip);
  } catch (err) {
    throw err;
  }
});

// DELETE /api/trips/:id
router.delete("/:id", authorize(...mutateRoles), (req: Request, res: Response) => {
  const deleted = tripService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.status(204).send();
});

export default router;
