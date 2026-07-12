import { Router } from "express";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import driversRouter from "./drivers";
import expensesRouter from "./expenses";
import fuelLogsRouter from "./fuel-logs";
import maintenanceRouter from "./maintenance";
import tripsRouter from "./trips";
import vehiclesRouter from "./vehicles";

import reportsRouter from "./reports.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/drivers", driversRouter);
router.use("/expenses", expensesRouter);
router.use("/fuel-logs", fuelLogsRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/reports", reportsRouter);
router.use("/trips", tripsRouter);
router.use("/vehicles", vehiclesRouter);

export default router;
