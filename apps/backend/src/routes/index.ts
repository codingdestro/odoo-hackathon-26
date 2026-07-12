import { Router } from "express";
import authRouter from "./auth/index.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRouter);

export default router;
