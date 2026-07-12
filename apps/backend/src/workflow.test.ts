import { test, describe, beforeAll, afterAll, expect } from "bun:test";
import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./util/error-handler";
import db from "./db/index";

const BASE = "http://localhost:30333/api";

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", router);
  app.use(errorHandler);
  return app;
}

let server: ReturnType<typeof createApp>["listen"] | null = null;
let token = "";
let vehicleId = "";
let vehicleReg = "";
const vehicleIds: string[] = [];

function clearTables() {
  db.run("DELETE FROM expenses");
  db.run("DELETE FROM fuel_logs");
  db.run("DELETE FROM maintenance_logs");
  db.run("DELETE FROM trips");
  db.run("DELETE FROM drivers");
  db.run("DELETE FROM vehicles");
  // Don't delete users — keep admin
}

async function post(path: string, body: object, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = res.headers.get("content-type")?.includes("json") ? await res.json() : null;
  return { status: res.status, data };
}

async function get(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...headers },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function put(path: string, body: object, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function del(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...headers },
  });
  return { status: res.status };
}

function auth() {
  return { Authorization: `Bearer ${token}` };
}

// Start server once
const app = createApp();
server = app.listen(30333, () => {});
clearTables();

// ============================================================
// 1. Authentication
// ============================================================
describe("1. Authentication", () => {
  test("Register admin user", async () => {
    const { data: roles } = await get("/auth/roles");
    expect(Array.isArray(roles)).toBe(true);
    // Roles may be empty if DB not seeded yet — seed directly
    if (roles.length === 0) {
      db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (?, 'ADMIN')", [crypto.randomUUID()]);
      db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (?, 'FLEET_MANAGER')", [crypto.randomUUID()]);
      db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (?, 'DISPATCHER')", [crypto.randomUUID()]);
      db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (?, 'SAFETY_OFFICER')", [crypto.randomUUID()]);
      db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (?, 'FINANCIAL_ANALYST')", [crypto.randomUUID()]);
    }
    const { data: roles2 } = await get("/auth/roles");
    const adminRole = roles2.find((r: any) => r.name === "ADMIN") || roles2[0];
    expect(adminRole).toBeDefined();
    expect(adminRole.id).toBeDefined();

    const res = await post("/auth/signup", {
      name: "Admin User",
      email: "admin@fleet.test",
      password: "admin123",
      roleId: adminRole.id,
    });
    expect([201, 409]).toContain(res.status);
  });

  test("Login with valid credentials", async () => {
    const { status, data } = await post("/auth/signin", {
      email: "admin@fleet.test",
      password: "admin123",
    });
    expect(status).toBe(200);
    expect(data.token).toBeDefined();
    token = data.token;
  });

  test("Login with invalid credentials", async () => {
    const { status } = await post("/auth/signin", {
      email: "admin@fleet.test",
      password: "wrong",
    });
    expect(status).toBe(401);
  });

  test("Get current user (RBAC)", async () => {
    const { status, data } = await get("/auth/me", auth());
    expect(status).toBe(200);
    expect(data.id).toBeDefined();
  });

  test("Logout", async () => {
    const { status } = await post("/auth/logout", {});
    expect(status).toBe(200);
    // Re-login for remaining tests
    const { data } = await post("/auth/signin", { email: "admin@fleet.test", password: "admin123" });
    token = data.token;
  });
});

// ============================================================
// 2. Vehicle Module
// ============================================================
describe("2. Vehicle Module", () => {
  test("Create Vehicle", async () => {
    vehicleReg = `KCA ${Date.now()}`;
    const { status, data } = await post("/vehicles", {
      registrationNumber: vehicleReg,
      model: "Isuzu FRR 90",
      vehicleType: "Truck",
      maxLoadCapacity: 5000,
      acquisitionCost: 2500000,
      status: "AVAILABLE",
    }, auth());
    expect(status).toBe(201);
    expect(data.registrationNumber).toBe(vehicleReg);
    vehicleId = data.id;
  });

  test("Edit Vehicle", async () => {
    const { status, data } = await put(`/vehicles/${vehicleId}`, {
      model: "Isuzu FRR 95",
      odometer: 1500,
    }, auth());
    expect(status).toBe(200);
    expect(data.model).toBe("Isuzu FRR 95");
  });

  test("Delete Vehicle", async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "DEL-" + Date.now(),
      model: "To Delete",
      vehicleType: "Van",
      maxLoadCapacity: 1000,
      acquisitionCost: 500000,
    }, auth());
    const { status } = await del(`/vehicles/${v.id}`, auth());
    expect(status).toBe(204);
  });

  test("Duplicate Registration Number", async () => {
    const { status } = await post("/vehicles", {
      registrationNumber: vehicleReg,
      model: "Another",
      vehicleType: "Van",
      maxLoadCapacity: 3000,
      acquisitionCost: 1000000,
    }, auth());
    expect(status).toBe(409);
  });

  test("Filter by Status", async () => {
    const { data } = await get("/dashboard?status=IN_SHOP", auth());
    expect(data.vehicles).toBeDefined();
  });
});

// ============================================================
// 3. Driver Module
// ============================================================
describe("3. Driver Module", () => {
  let driverId = "";

  test("Create Driver", async () => {
    const { status, data } = await post("/drivers", {
      name: "John Kamau",
      licenseNumber: "DL-" + Date.now(),
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
      contactNumber: "0712 345 678",
    }, auth());
    expect(status).toBe(201);
    driverId = data.id;
  });

  test("Edit Driver", async () => {
    const { status, data } = await put(`/drivers/${driverId}`, {
      name: "John Mwangi Kamau",
    }, auth());
    expect(status).toBe(200);
    expect(data.name).toBe("John Mwangi Kamau");
  });

  test("Delete Driver", async () => {
    const { data: d } = await post("/drivers", {
      name: "To Delete",
      licenseNumber: "DL-DEL-" + Date.now(),
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
    }, auth());
    const { status } = await del(`/drivers/${d.id}`, auth());
    expect(status).toBe(204);
  });

  test("Expired License Driver", async () => {
    const { data } = await post("/drivers", {
      name: "Expired Driver",
      licenseNumber: "DL-EXP-" + Date.now(),
      licenseExpiry: "2020-01-01T00:00:00.000Z",
    }, auth());
    expect(data.id).toBeDefined();
  });

  test("Suspended Driver", async () => {
    const { data } = await post("/drivers", {
      name: "Suspended Driver",
      licenseNumber: "DL-SUS-" + Date.now(),
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
      status: "SUSPENDED",
    }, auth());
    expect(data.status).toBe("SUSPENDED");
  });
});

// ============================================================
// 4. Trip Module
// ============================================================
describe("4. Trip Module", () => {
  let vId = "";
  let dId = "";
  let tripId = "";

  beforeAll(async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "TRIPV-" + Date.now(),
      model: "Mitsubishi Fuso",
      vehicleType: "Truck",
      maxLoadCapacity: 8000,
      acquisitionCost: 3000000,
    }, auth());
    vId = v.id;

    const { data: d } = await post("/drivers", {
      name: "Peter Otieno",
      licenseNumber: "DL-TRI-" + Date.now(),
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
    }, auth());
    dId = d.id;
  });

  test("Create Trip (Save Draft)", async () => {
    const { status, data } = await post("/trips", {
      source: "Nairobi",
      destination: "Mombasa",
      vehicleId: vId,
      driverId: dId,
      cargoWeight: 3000,
      plannedDistance: 480,
    }, auth());
    expect(status).toBe(201);
    expect(data.status).toBe("DRAFT");
    tripId = data.id;
  });

  test("Dispatch Trip", async () => {
    const { status, data } = await post(`/trips/${tripId}/dispatch`, {}, auth());
    expect(status).toBe(200);
    expect(data.status).toBe("DISPATCHED");
    expect(data.dispatchedAt).toBeDefined();
  });

  test("Vehicle → ON_TRIP", async () => {
    const { data } = await get(`/vehicles/${vId}`, auth());
    expect(data.status).toBe("ON_TRIP");
  });

  test("Driver → ON_TRIP", async () => {
    const { data } = await get(`/drivers/${dId}`, auth());
    expect(data.status).toBe("ON_TRIP");
  });

  test("Driver On Trip - Cannot dispatch another", async () => {
    const { data: v2 } = await post("/vehicles", {
      registrationNumber: "TRIPV2-" + Date.now(),
      model: "Hino 500",
      vehicleType: "Truck",
      maxLoadCapacity: 5000,
      acquisitionCost: 2000000,
    }, auth());

    const { data: t } = await post("/trips", {
      source: "Nakuru",
      destination: "Eldoret",
      vehicleId: v2.id,
      driverId: dId,
      cargoWeight: 2000,
      plannedDistance: 150,
    }, auth());
    const { status } = await post(`/trips/${t.id}/dispatch`, {}, auth());
    expect(status).toBe(400);
  });

  test("Cargo > Capacity (Should Fail)", async () => {
    const { data: v3 } = await post("/vehicles", {
      registrationNumber: "TRIPV3-" + Date.now(),
      model: "Small Truck",
      vehicleType: "Truck",
      maxLoadCapacity: 2000,
      acquisitionCost: 1000000,
    }, auth());
    const { data: d2 } = await post("/drivers", {
      name: "Driver Two",
      licenseNumber: "DL-TRX-" + Date.now(),
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
    }, auth());
    const { data: t } = await post("/trips", {
      source: "A",
      destination: "B",
      vehicleId: v3.id,
      driverId: d2.id,
      cargoWeight: 15000,
      plannedDistance: 100,
    }, auth());
    const { status } = await post(`/trips/${t.id}/dispatch`, {}, auth());
    expect(status).toBe(400);
  });

  test("Complete Trip", async () => {
    const { status, data } = await post(`/trips/${tripId}/complete`, {
      endOdometer: 500,
      fuelConsumed: 55,
    }, auth());
    expect(status).toBe(200);
    expect(data.status).toBe("COMPLETED");
  });

  test("Vehicle → AVAILABLE", async () => {
    const { data } = await get(`/vehicles/${vId}`, auth());
    expect(data.status).toBe("AVAILABLE");
  });

  test("Driver → AVAILABLE", async () => {
    const { data } = await get(`/drivers/${dId}`, auth());
    expect(data.status).toBe("AVAILABLE");
  });

  test("Cancel Trip", async () => {
    const { data: t } = await post("/trips", {
      source: "Thika",
      destination: "Nyeri",
      vehicleId: vId,
      driverId: dId,
      cargoWeight: 1000,
      plannedDistance: 120,
    }, auth());
    await post(`/trips/${t.id}/dispatch`, {}, auth());
    const { status, data } = await post(`/trips/${t.id}/cancel`, {}, auth());
    expect(status).toBe(200);
    expect(data.status).toBe("CANCELLED");

    const { data: v } = await get(`/vehicles/${vId}`, auth());
    expect(v.status).toBe("AVAILABLE");
  });
});

// ============================================================
// 5. Maintenance Module
// ============================================================
describe("5. Maintenance Module", () => {
  let vId = "";

  beforeAll(async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "MAINT-" + Date.now(),
      model: "Toyota Hino",
      vehicleType: "Truck",
      maxLoadCapacity: 6000,
      acquisitionCost: 2800000,
    }, auth());
    vId = v.id;
  });

  test("Create Maintenance → IN_SHOP", async () => {
    const { status, data } = await post("/maintenance", {
      vehicleId: vId,
      title: "Brake Replacement",
      maintenanceCost: 15000,
    }, auth());
    expect(status).toBe(201);
    expect(data.status).toBe("ACTIVE");

    const { data: v } = await get(`/vehicles/${vId}`, auth());
    expect(v.status).toBe("IN_SHOP");
  });

  test("Vehicle Hidden From Dispatch", async () => {
    const { data: d } = await post("/drivers", {
      name: "Maint Driver",
      licenseNumber: "DL-MT-" + Date.now(),
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
    }, auth());
    const { data: t } = await post("/trips", {
      source: "A", destination: "B",
      vehicleId: vId, driverId: d.id,
      cargoWeight: 1000, plannedDistance: 100,
    }, auth());
    const { status } = await post(`/trips/${t.id}/dispatch`, {}, auth());
    expect(status).toBe(400);
  });

  test("Complete Maintenance → AVAILABLE", async () => {
    const { data: logs } = await get("/maintenance", auth());
    const activeLog = logs.find((l: any) => l.status === "ACTIVE");
    const { status } = await post(`/maintenance/${activeLog.id}/complete`, {}, auth());
    expect(status).toBe(200);

    const { data: v } = await get(`/vehicles/${vId}`, auth());
    expect(v.status).toBe("AVAILABLE");
  });
});

// ============================================================
// 6. Fuel Module
// ============================================================
describe("6. Fuel Module", () => {
  let vId = "";

  beforeAll(async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "FUEL-" + Date.now(),
      model: "Scania R",
      vehicleType: "Truck",
      maxLoadCapacity: 10000,
      acquisitionCost: 5000000,
    }, auth());
    vId = v.id;
  });

  test("Add Fuel Log", async () => {
    const { status, data } = await post("/fuel-logs", {
      vehicleId: vId,
      liters: 80,
      amount: 12000,
      fuelDate: new Date().toISOString(),
      odometer: 45200,
    }, auth());
    expect(status).toBe(201);
    expect(data.liters).toBe(80);
  });

  test("Verify Fuel Cost", async () => {
    const { data } = await get("/expenses/summaries", auth());
    const summary = data.find((s: any) => s.registrationNumber);
    expect(summary).toBeDefined();
  });

  test("Verify Fuel History", async () => {
    const { data } = await get("/fuel-logs", auth());
    expect(data.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 7. Expense Module
// ============================================================
describe("7. Expense Module", () => {
  beforeAll(async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "EXP-" + Date.now(),
      model: "Toyota Dyna",
      vehicleType: "Truck",
      maxLoadCapacity: 4000,
      acquisitionCost: 1800000,
    }, auth());
  });

  test("Add Toll Expense", async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "EXP2-" + Date.now(),
      model: "Nissan UD",
      vehicleType: "Truck",
      maxLoadCapacity: 5000,
      acquisitionCost: 2200000,
    }, auth());
    const { status } = await post("/expenses", {
      vehicleId: v.id,
      expenseType: "Toll",
      amount: 500,
      expenseDate: new Date().toISOString(),
    }, auth());
    expect(status).toBe(201);
  });

  test("Add Repair Expense", async () => {
    const { data: v } = await post("/vehicles", {
      registrationNumber: "EXP3-" + Date.now(),
      model: "Hino 300",
      vehicleType: "Truck",
      maxLoadCapacity: 3000,
      acquisitionCost: 1500000,
    }, auth());
    const { status } = await post("/expenses", {
      vehicleId: v.id,
      expenseType: "Repair",
      amount: 3500,
      expenseDate: new Date().toISOString(),
    }, auth());
    expect(status).toBe(201);
  });

  test("Verify Total Cost", async () => {
    const { data } = await get("/expenses/summaries", auth());
    expect(data.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 8. Dashboard
// ============================================================
describe("8. Dashboard KPIs", () => {
  test("Verify Total Vehicles, Available Vehicles", async () => {
    const { data } = await get("/dashboard", auth());
    expect(data.vehicles.total).toBeGreaterThan(0);
    expect(data.vehicles.available).toBeDefined();
  });

  test("Verify Active Trips and On Duty", async () => {
    const { data } = await get("/dashboard", auth());
    expect(data.trips).toBeDefined();
    expect(data.drivers).toBeDefined();
  });

  test("Verify Fleet Utilization", async () => {
    const { data } = await get("/dashboard", auth());
    expect(data.vehicles.utilizationPercent).toBeDefined();
  });
});

// ============================================================
// 9. Reports
// ============================================================
describe("9. Reports", () => {
  test("Fuel Efficiency", async () => {
    const { status, data } = await get("/reports/analytics", auth());
    expect(status).toBe(200);
    expect(data.vehicleReports).toBeDefined();
  });

  test("Operational Cost and ROI", async () => {
    const { data } = await get("/reports/analytics", auth());
    expect(data.totalOperationalCost).toBeDefined();
  });

  test("CSV Export", async () => {
    const res = await fetch(`${BASE}/reports/export/csv`, { headers: auth() });
    expect(res.status).toBe(200);
  });
});

// ============================================================
// 10. Business Rules
// ============================================================
describe("10. Business Rules", () => {
  test("Duplicate Registration Blocked", async () => {
    const reg = "DUP-" + Date.now();
    await post("/vehicles", { registrationNumber: reg, model: "A", vehicleType: "Truck", maxLoadCapacity: 5000, acquisitionCost: 2000000 }, auth());
    const { status } = await post("/vehicles", { registrationNumber: reg, model: "B", vehicleType: "Truck", maxLoadCapacity: 4000, acquisitionCost: 1500000 }, auth());
    expect(status).toBe(409);
  });

  test("Expired License Rejected", async () => {
    const { data: v } = await post("/vehicles", { registrationNumber: "LIC-" + Date.now(), model: "T", vehicleType: "Truck", maxLoadCapacity: 5000, acquisitionCost: 2000000 }, auth());
    const { data: d } = await post("/drivers", { name: "Expired", licenseNumber: "DL-EXPX-" + Date.now(), licenseExpiry: "2020-01-01T00:00:00.000Z" }, auth());
    const { data: t } = await post("/trips", { source: "A", destination: "B", vehicleId: v.id, driverId: d.id, cargoWeight: 1000, plannedDistance: 100 }, auth());
    const { status } = await post(`/trips/${t.id}/dispatch`, {}, auth());
    expect(status).toBe(400);
  });

  test("Reports Updated After Fuel Log", async () => {
    const { data } = await get("/reports/analytics", auth());
    expect(data.totalFuelCost).toBeGreaterThan(0);
  });
});

// ============================================================
// 11. End-to-End Scenario
// ============================================================
describe("11. End-to-End Scenario", () => {
  test("Full fleet workflow", async () => {
    const h = auth();

    const { data: v1 } = await post("/vehicles", {
      registrationNumber: "SCANIA-" + Date.now(),
      model: "Scania G450",
      vehicleType: "Truck",
      maxLoadCapacity: 12000,
      acquisitionCost: 6000000,
    }, h);
    expect(v1.status).toBe("AVAILABLE");

    const { data: d1 } = await post("/drivers", {
      name: "James Omondi",
      licenseNumber: "DL-E2E-" + Date.now(),
      licenseCategory: "C",
      licenseExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
    }, h);

    const { data: t1 } = await post("/trips", {
      source: "Mombasa", destination: "Nairobi",
      vehicleId: v1.id, driverId: d1.id,
      cargoWeight: 8000, plannedDistance: 480,
    }, h);
    expect(t1.status).toBe("DRAFT");

    const { data: dispatch } = await post(`/trips/${t1.id}/dispatch`, {}, h);
    expect(dispatch.status).toBe("DISPATCHED");

    const { data: vCheck } = await get(`/vehicles/${v1.id}`, h);
    expect(vCheck.status).toBe("ON_TRIP");

    const { data: dCheck } = await get(`/drivers/${d1.id}`, h);
    expect(dCheck.status).toBe("ON_TRIP");

    await post(`/trips/${t1.id}/complete`, { endOdometer: 48500, fuelConsumed: 80 }, h);

    expect((await get(`/vehicles/${v1.id}`, h)).data.status).toBe("AVAILABLE");
    expect((await get(`/drivers/${d1.id}`, h)).data.status).toBe("AVAILABLE");

    await post("/fuel-logs", { vehicleId: v1.id, tripId: t1.id, liters: 80, amount: 12000, fuelDate: new Date().toISOString() }, h);
    await post("/expenses", { vehicleId: v1.id, expenseType: "Toll", amount: 600, expenseDate: new Date().toISOString() }, h);

    const { data: maint } = await post("/maintenance", { vehicleId: v1.id, title: "Oil Change", maintenanceCost: 8000 }, h);
    expect(maint.status).toBe("ACTIVE");
    expect((await get(`/vehicles/${v1.id}`, h)).data.status).toBe("IN_SHOP");

    await post(`/maintenance/${maint.id}/complete`, {}, h);
    expect((await get(`/vehicles/${v1.id}`, h)).data.status).toBe("AVAILABLE");

    const { data: dashboard } = await get("/dashboard", h);
    expect(dashboard.vehicles.total).toBeGreaterThan(0);
    expect(dashboard.trips.completed).toBeGreaterThan(0);
    expect(dashboard.costs.totalFuel).toBeGreaterThan(0);

    const reportRes = await fetch(`${BASE}/reports/export/csv`, { headers: h });
    expect(reportRes.status).toBe(200);
  });
});

// Close server after all tests
afterAll(() => {
  server?.close();
});
