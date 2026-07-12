import { Router, Request, Response } from "express";
import { SignUpSchema, SignInSchema } from "@odoo-hackathon-26/shared";
import { authRequired } from "../../util/auth";
import { authService } from "../../services/auth.service";

const router = Router();

// POST /api/auth/signup
router.post("/signup", (req: Request, res: Response) => {
  const parsed = SignUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, roleId } = parsed.data;

  if (!authService.roleExists(roleId)) {
    res.status(400).json({ error: "Invalid roleId" });
    return;
  }

  if (authService.emailExists(email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const user = authService.signup(parsed.data);
  res.status(201).json(user);
});

// POST /api/auth/signin
router.post("/signin", async (req: Request, res: Response) => {
  const parsed = SignInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = await authService.signin(parsed.data);

  if (!result) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.json(result);
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", authRequired, (req: Request, res: Response) => {
  const user = authService.getUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// GET /api/auth/roles
router.get("/roles", (_req: Request, res: Response) => {
  res.json(authService.listRoles());
});

export default router;
