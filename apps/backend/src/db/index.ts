//@ts-expect-error Bun's sqlite on runtime
import { Database } from "bun:sqlite";
import path from "node:path";
import { mkdirSync } from "node:fs";

const DB_DIR = path.join(import.meta.dirname, "pool");
mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, "data.db");

const db = new Database(DB_PATH);

db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA foreign_keys = ON");

// Roles Table
db.run(`
  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Users Table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (role_id) REFERENCES roles(id)
  )
`);

// Vehicles Table
db.run(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    registration_number TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    max_load_capacity REAL NOT NULL,
    odometer REAL NOT NULL DEFAULT 0,
    acquisition_cost REAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Drivers Table
db.run(`
  CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    license_category TEXT,
    license_expiry TEXT NOT NULL,
    contact_number TEXT,
    safety_score REAL NOT NULL DEFAULT 100,
    status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Trips Table
db.run(`
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    trip_number TEXT NOT NULL UNIQUE,
    vehicle_id TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    cargo_weight REAL NOT NULL,
    planned_distance REAL NOT NULL,
    actual_distance REAL,
    start_odometer REAL,
    end_odometer REAL,
    fuel_consumed REAL,
    revenue REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED')),
    dispatched_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
  )
`);

// Maintenance Logs Table
db.run(`
  CREATE TABLE IF NOT EXISTS maintenance_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    maintenance_cost REAL NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  )
`);

// Fuel Logs Table
db.run(`
  CREATE TABLE IF NOT EXISTS fuel_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    trip_id TEXT,
    liters REAL NOT NULL,
    amount REAL NOT NULL,
    fuel_date TEXT NOT NULL,
    odometer REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  )
`);

// Expenses Table
db.run(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    trip_id TEXT,
    expense_type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    expense_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  )
`);

export default db;
