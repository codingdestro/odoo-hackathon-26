import { Router } from "express";
import authRouter from "./auth/index.js";
import dashboardRouter from "./dashboard.js";
import driversRouter from "./drivers.js";
import expensesRouter from "./expenses.js";
import fuelLogsRouter from "./fuel-logs.js";
import maintenanceRouter from "./maintenance.js";
import tripsRouter from "./trips.js";
import vehiclesRouter from "./vehicles.js";

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
router.use("/trips", tripsRouter);
router.use("/vehicles", vehiclesRouter);

export default router;
