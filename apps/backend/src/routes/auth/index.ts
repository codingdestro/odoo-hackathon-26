import Bun from "bun";
import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { SignUpSchema, SignInSchema } from "@odoo-hackathon-26/shared";
import { createToken } from "../../util/jwt";
import { authRequired } from "../../util/auth";
import db from "../../db/index";

const router = Router();

const userCols =
  "id, role_id AS roleId, name, email, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt";

// POST /api/auth/signup
router.post("/signup", (req: Request, res: Response) => {
  const parsed = SignUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, email, password, roleId } = parsed.data;

  const existingRole = db
    .query("SELECT id FROM roles WHERE id = ?")
    .get(roleId);
  if (!existingRole) {
    res.status(400).json({ error: "Invalid roleId" });
    return;
  }

  const emailTaken = db
    .query("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (emailTaken) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const id = uuid();
  const hash = Bun.password.hashSync(password);

  db.run(
    "INSERT INTO users (id, role_id, name, email, password_hash) VALUES (?, ?, ?, ?, ?)",
    [id, roleId, name, email, hash],
  );

  const user = db.query(`SELECT ${userCols} FROM users WHERE id = ?`).get(id);
  res.status(201).json(user);
});

// POST /api/auth/signin
router.post("/signin", async (req: Request, res: Response) => {
  const parsed = SignInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  const row = db
    .query(
      "SELECT id, role_id AS roleId, password_hash AS passwordHash, is_active AS isActive FROM users WHERE email = ?",
    )
    .get(email) as
    | { id: string; roleId: string; passwordHash: string; isActive: number }
    | undefined;

  if (!row) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (!row.isActive) {
    res.status(403).json({ error: "Account is deactivated" });
    return;
  }

  const valid = Bun.password.verifySync(password, row.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = await createToken({ userId: row.id, roleId: row.roleId });

  const user = db
    .query(`SELECT ${userCols} FROM users WHERE id = ?`)
    .get(row.id);
  res.json({ token, user });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", authRequired, (req: Request, res: Response) => {
  const user = db
    .query(`SELECT ${userCols} FROM users WHERE id = ?`)
    .get(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

//GET /api/auth/roles
router.get("/roles", (_req: Request, res: Response) => {
  const roles = db.query("SELECT id, name FROM roles").all();
  res.json(roles);
});

export default router;
