import { Router, Request, Response } from "express";
import db from "./db";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  db.prepare("SELECT 1").get();
  res.status(200).json({ status: "ok" });
});

export default router;
