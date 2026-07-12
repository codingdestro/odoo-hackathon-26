import { Router, Request, Response } from "express";
import { authRequired } from "../util/auth";
import { dashboardService } from "../services/dashboard.service";

const router = Router();

router.use(authRequired);

// GET /api/dashboard
router.get("/", (req: Request, res: Response) => {
  const { vehicleType, status } = req.query;
  const filters: { vehicleType?: string; status?: string } = {};
  if (typeof vehicleType === "string") filters.vehicleType = vehicleType;
  if (typeof status === "string") filters.status = status;

  const kpis = dashboardService.getKPIs(filters);
  res.json(kpis);
});

export default router;
