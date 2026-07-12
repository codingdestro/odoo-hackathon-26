import { Router } from "express";
import authRouter from "./auth/index.js";
import vehiclesRouter from "./vehicles.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/vehicles", vehiclesRouter);

export default router;
