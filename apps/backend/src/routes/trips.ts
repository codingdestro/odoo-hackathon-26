import { Router, Request, Response } from "express";
import { CreateTripSchema, UpdateTripSchema } from "@odoo-hackathon-26/shared";
import { authRequired } from "../util/auth";
import { tripService } from "../services/trip.service";

const router = Router();

router.use(authRequired);

// GET /api/trips
router.get("/", (_req: Request, res: Response) => {
  res.json(tripService.list());
});

// GET /api/trips/:id
router.get("/:id", (req: Request, res: Response) => {
  const trip = tripService.getById(req.params.id as string);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(trip);
});

// POST /api/trips
router.post("/", (req: Request, res: Response) => {
  const parsed = CreateTripSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const trip = tripService.create(parsed.data);
  res.status(201).json(trip);
});

// PUT /api/trips/:id
router.put("/:id", (req: Request, res: Response) => {
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
router.post("/:id/dispatch", (req: Request, res: Response) => {
  try {
    const trip = tripService.dispatch(req.params.id as string);
    res.json(trip);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /api/trips/:id
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = tripService.delete(req.params.id as string);
  if (!deleted) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.status(204).send();
});

export default router;
