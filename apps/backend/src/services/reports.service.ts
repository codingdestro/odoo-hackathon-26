import db from "../db/index";

interface VehicleReport {
  registrationNumber: string;
  model: string;
  vehicleType: string;
  status: string;
  totalTrips: number;
  totalDistance: number;
  totalFuelConsumed: number;
  fuelEfficiency: number;
  totalRevenue: number;
  maintenanceCost: number;
  fuelCost: number;
  otherExpenses: number;
  operationalCost: number;
  acquisitionCost: number;
  roi: number;
}

interface FleetAnalytics {
  utilizationPercent: number;
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpenses: number;
  totalOperationalCost: number;
  avgFuelEfficiency: number;
  vehicleReports: VehicleReport[];
}

function toNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export const reportsService = {
  getVehicleAnalytics(): VehicleReport[] {
    const vehicles = db.query(
      "SELECT id, registration_number AS registrationNumber, model, vehicle_type AS vehicleType, status, acquisition_cost AS acquisitionCost FROM vehicles ORDER BY registration_number"
    ).all() as any[];

    return vehicles.map((v) => {
      const tripStats = db.query(
        `SELECT COUNT(*) as count,
                COALESCE(SUM(COALESCE(actual_distance, planned_distance)), 0) as totalDistance,
                COALESCE(SUM(fuel_consumed), 0) as totalFuel,
                COALESCE(SUM(revenue), 0) as totalRevenue
         FROM trips WHERE vehicle_id = ?`
      ).get(v.id) as any;

      const maintenanceTotal = db.query(
        "SELECT COALESCE(SUM(maintenance_cost), 0) as total FROM maintenance_logs WHERE vehicle_id = ?"
      ).get(v.id) as any;

      const fuelTotal = db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM fuel_logs WHERE vehicle_id = ?"
      ).get(v.id) as any;

      const otherExpenses = db.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE vehicle_id = ?"
      ).get(v.id) as any;

      const totalDistance = toNumber(tripStats?.totalDistance);
      const totalFuel = toNumber(tripStats?.totalFuel);
      const totalRevenue = toNumber(tripStats?.totalRevenue);
      const maintCost = toNumber(maintenanceTotal?.total);
      const fuelCost = toNumber(fuelTotal?.total);
      const otherCost = toNumber(otherExpenses?.total);
      const opCost = maintCost + fuelCost + otherCost;
      const acquisition = toNumber(v.acquisitionCost, 1);

      return {
        registrationNumber: v.registrationNumber,
        model: v.model,
        vehicleType: v.vehicleType,
        status: v.status,
        totalTrips: toNumber(tripStats?.count),
        totalDistance,
        totalFuelConsumed: totalFuel,
        fuelEfficiency: totalFuel > 0 ? Math.round((totalDistance / totalFuel) * 100) / 100 : 0,
        totalRevenue,
        maintenanceCost: maintCost,
        fuelCost,
        otherExpenses: otherCost,
        operationalCost: opCost,
        acquisitionCost: acquisition,
        roi: acquisition > 0 ? Math.round(((totalRevenue - opCost) / acquisition) * 100) / 100 : 0,
      };
    });
  },

  getFleetAnalytics(): FleetAnalytics {
    const reports = this.getVehicleAnalytics();

    const totalVehicles = reports.length;
    const onTripCount = reports.filter((r) => r.status === "ON_TRIP").length;

    const totalRevenue = reports.reduce((s, r) => s + r.totalRevenue, 0);
    const totalFuelCost = reports.reduce((s, r) => s + r.fuelCost, 0);
    const totalMaintenanceCost = reports.reduce((s, r) => s + r.maintenanceCost, 0);
    const totalExpenses = reports.reduce((s, r) => s + r.otherExpenses, 0);
    const totalOpCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

    const totalDistance = reports.reduce((s, r) => s + r.totalDistance, 0);
    const totalFuel = reports.reduce((s, r) => s + r.totalFuelConsumed, 0);

    return {
      utilizationPercent: totalVehicles > 0 ? Math.round((onTripCount / totalVehicles) * 100) : 0,
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      totalExpenses,
      totalOperationalCost: totalOpCost,
      avgFuelEfficiency: totalFuel > 0 ? Math.round((totalDistance / totalFuel) * 100) / 100 : 0,
      vehicleReports: reports,
    };
  },

  toCSV(data: FleetAnalytics): string {
    const headers = [
      "Registration Number", "Model", "Type", "Status",
      "Total Trips", "Total Distance (km)", "Fuel Consumed (L)",
      "Fuel Efficiency (km/L)", "Revenue", "Maintenance Cost",
      "Fuel Cost", "Other Expenses", "Operational Cost",
      "Acquisition Cost", "ROI"
    ];

    const rows = data.vehicleReports.map((r) => [
      r.registrationNumber, r.model, r.vehicleType, r.status,
      r.totalTrips, r.totalDistance, r.totalFuelConsumed,
      r.fuelEfficiency, r.totalRevenue, r.maintenanceCost,
      r.fuelCost, r.otherExpenses, r.operationalCost,
      r.acquisitionCost, r.roi.toFixed(2),
    ]);

    // Fleet summary row
    const summaryRow = [
      "FLEET SUMMARY", "", "", "",
      "", data.vehicleReports.reduce((s, r) => s + r.totalDistance, 0),
      data.vehicleReports.reduce((s, r) => s + r.totalFuelConsumed, 0),
      data.avgFuelEfficiency, data.totalRevenue, data.totalMaintenanceCost,
      data.totalFuelCost, data.totalExpenses, data.totalOperationalCost,
      "", ""
    ];

    const csvLines = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
      "",
      summaryRow.join(","),
      "",
      "Fleet Utilization," + data.utilizationPercent + "%",
      "Total Revenue," + data.totalRevenue,
      "Total Operational Cost," + data.totalOperationalCost,
      "Avg Fuel Efficiency," + data.avgFuelEfficiency + " km/L",
    ];

    return csvLines.join("\n");
  },
};
