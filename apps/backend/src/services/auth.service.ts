import { v4 as uuid } from "uuid";
import type { SignUp, SignIn, User } from "@odoo-hackathon-26/shared";
import { createToken } from "../util/jwt";
import db from "../db/index";

const userCols =
  "id, role_id AS roleId, name, email, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt";

export const authService = {
  signup(data: SignUp): User {
    const id = uuid();
    const hash = Bun.password.hashSync(data.password);

    db.run(
      "INSERT INTO users (id, role_id, name, email, password_hash) VALUES (?, ?, ?, ?, ?)",
      [id, data.roleId, data.name, data.email, hash],
    );

    return db.query(`SELECT ${userCols} FROM users WHERE id = ?`).get(id) as User;
  },

  emailExists(email: string): boolean {
    const row = db.query("SELECT id FROM users WHERE email = ?").get(email);
    return row !== null;
  },

  roleExists(roleId: string): boolean {
    const row = db.query("SELECT id FROM roles WHERE id = ?").get(roleId);
    return row !== null;
  },

  async signin(data: SignIn): Promise<{ token: string; user: User } | null> {
    const row = db
      .query("SELECT id, role_id AS roleId, password_hash AS passwordHash, is_active AS isActive FROM users WHERE email = ?")
      .get(data.email) as { id: string; roleId: string; passwordHash: string; isActive: number } | undefined;

    if (!row) return null;
    if (!row.isActive) return null;

    const valid = Bun.password.verifySync(data.password, row.passwordHash);
    if (!valid) return null;

    const token = await createToken({ userId: row.id, roleId: row.roleId });
    const user = db.query(`SELECT ${userCols} FROM users WHERE id = ?`).get(row.id) as User;

    return { token, user };
  },

  getUserById(id: string): User | undefined {
    return db.query(`SELECT ${userCols} FROM users WHERE id = ?`).get(id) as User | undefined;
  },

  listRoles(): { id: string; name: string }[] {
    return db.query("SELECT id, name FROM roles").all() as { id: string; name: string }[];
  },
};
