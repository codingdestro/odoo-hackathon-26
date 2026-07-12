import db from "../db/index";

interface DashboardKPIs {
  vehicles: {
    total: number;
    active: number;
    available: number;
    inShop: number;
    onTrip: number;
    retired: number;
    byType: { vehicleType: string; count: number }[];
    utilizationPercent: number;
  };
  drivers: {
    total: number;
    available: number;
    onDuty: number;
    offDuty: number;
    suspended: number;
  };
  trips: {
    total: number;
    active: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  costs: {
    totalFuel: number;
    totalMaintenance: number;
    totalExpenses: number;
  };
  recentTrips: {
    id: string;
    tripNumber: string;
    source: string;
    destination: string;
    cargoWeight: number;
    status: string;
    createdAt: string;
    vehicleReg: string;
    driverName: string;
  }[];
}

function count(q: string, ...params: any[]): number {
  const row = db.query(q).get(...params) as { count: number } | undefined;
  return row?.count ?? 0;
}

function sum(q: string): number {
  const row = db.query(q).get() as { total: number } | undefined;
  return row?.total ?? 0;
}

export const dashboardService = {
  getKPIs(filters?: { vehicleType?: string; status?: string }): DashboardKPIs {
    const vFilter = filters?.vehicleType ? ` AND vehicle_type = '${filters.vehicleType.replace(/'/g, "''")}'` : "";
    const sFilter = filters?.status ? ` AND status = '${filters.status.replace(/'/g, "''")}'` : "";

    const totalVehicles = count(`SELECT COUNT(*) as count FROM vehicles WHERE 1=1${vFilter}${sFilter}`);
    const availableVehicles = count(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'AVAILABLE'${vFilter}`);
    const onTripCount = count(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'ON_TRIP'${vFilter}`);
    const inShopCount = count(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'IN_SHOP'${vFilter}`);
    const retiredCount = count(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'RETIRED'${vFilter}`);

    const availableDrivers = count("SELECT COUNT(*) as count FROM drivers WHERE status = 'AVAILABLE'");
    const onDutyDrivers = count("SELECT COUNT(*) as count FROM drivers WHERE status = 'ON_TRIP'");
    const offDutyDrivers = count("SELECT COUNT(*) as count FROM drivers WHERE status = 'OFF_DUTY'");
    const suspendedDrivers = count("SELECT COUNT(*) as count FROM drivers WHERE status = 'SUSPENDED'");

    const activeTrips = count("SELECT COUNT(*) as count FROM trips WHERE status = 'DISPATCHED'");
    const pendingTrips = count("SELECT COUNT(*) as count FROM trips WHERE status = 'DRAFT'");
    const completedTrips = count("SELECT COUNT(*) as count FROM trips WHERE status = 'COMPLETED'");
    const cancelledTrips = count("SELECT COUNT(*) as count FROM trips WHERE status = 'CANCELLED'");

    const totalFuel = sum("SELECT COALESCE(SUM(amount), 0) as total FROM fuel_logs");
    const totalMaintenance = sum("SELECT COALESCE(SUM(maintenance_cost), 0) as total FROM maintenance_logs");
    const totalExpenses = sum("SELECT COALESCE(SUM(amount), 0) as total FROM expenses");

    const byType = db.query("SELECT vehicle_type AS vehicleType, COUNT(*) as count FROM vehicles GROUP BY vehicle_type ORDER BY count DESC").all() as { vehicleType: string; count: number }[];

    const utilizationPercent = totalVehicles > 0 ? Math.round((onTripCount / totalVehicles) * 100) : 0;

    const recentTrips = db.query(
      `SELECT t.id, t.trip_number AS tripNumber, t.source, t.destination, t.cargo_weight AS cargoWeight, t.status, t.created_at AS createdAt,
              v.registration_number AS vehicleReg, d.name AS driverName
       FROM trips t
       JOIN vehicles v ON v.id = t.vehicle_id
       JOIN drivers d ON d.id = t.driver_id
       ORDER BY t.created_at DESC
       LIMIT 10`
    ).all() as any[];

    return {
      vehicles: {
        total: totalVehicles,
        active: onTripCount + availableVehicles,
        available: availableVehicles,
        inShop: inShopCount,
        onTrip: onTripCount,
        retired: retiredCount,
        byType,
        utilizationPercent,
      },
      drivers: {
        total: availableDrivers + onDutyDrivers + offDutyDrivers + suspendedDrivers,
        available: availableDrivers,
        onDuty: onDutyDrivers,
        offDuty: offDutyDrivers,
        suspended: suspendedDrivers,
      },
      trips: {
        total: activeTrips + pendingTrips + completedTrips + cancelledTrips,
        active: activeTrips,
        pending: pendingTrips,
        completed: completedTrips,
        cancelled: cancelledTrips,
      },
      costs: {
        totalFuel,
        totalMaintenance,
        totalExpenses,
      },
      recentTrips,
    };
  },
};
