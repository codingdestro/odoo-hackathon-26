import { Router } from "express";
import authRouter from "./auth/index";
import driversRouter from "./drivers";
import vehiclesRouter from "./vehicles";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/drivers", driversRouter);
router.use("/vehicles", vehiclesRouter);

export default router;
