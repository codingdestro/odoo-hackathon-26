// @ts-expect-error Bun runtime provides this module.
import { Database } from "bun:sqlite";
import path from "node:path";

const DB_PATH = path.join(import.meta.dirname, "..", "data.db");

const db = new Database(DB_PATH);

db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA foreign_keys = ON");

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

export default db;
