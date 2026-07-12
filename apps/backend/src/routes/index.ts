import { Router } from "express";
import authRouter from "./auth/index";
import driversRouter from "./drivers";
import vehiclesRouter from "./vehicles";
import tripsRouter from "./trips";
import maintenanceRouter from "./maintenance";
import fuelLogsRouter from "./fuel-logs";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/drivers", driversRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/trips", tripsRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/fuel-logs", fuelLogsRouter);

export default router;
