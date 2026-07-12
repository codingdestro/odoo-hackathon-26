import { Router, Request, Response } from "express";
import { authRequired, authorize } from "../util/auth";
import { reportsService } from "../services/reports.service";

const router = Router();

router.use(authRequired);

// GET /api/reports/analytics
router.get("/analytics", (_req: Request, res: Response) => {
  const data = reportsService.getFleetAnalytics();
  res.json(data);
});

// GET /api/reports/export/csv
router.get("/export/csv", (_req: Request, res: Response) => {
  const data = reportsService.getFleetAnalytics();
  const csv = reportsService.toCSV(data);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=fleet-report.csv");
  res.send(csv);
});

export default router;
