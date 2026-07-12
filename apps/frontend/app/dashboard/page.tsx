"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { DashboardCharts } from "@/components/ui/DashboardCharts";

interface RecentTrip {
  id: string;
  tripNumber: string;
  source: string;
  destination: string;
  cargoWeight: number;
  status: string;
  createdAt: string;
  vehicleReg: string;
  driverName: string;
}

interface DashboardData {
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
  drivers: { total: number; available: number; onDuty: number; offDuty: number; suspended: number };
  trips: { total: number; active: number; pending: number; completed: number; cancelled: number };
  costs: { totalFuel: number; totalMaintenance: number; totalExpenses: number };
  recentTrips: RecentTrip[];
}

const vehicleTypes = ["Truck", "Van", "Pickup", "Bus", "Trailer"];
const statusFilters = [
  { value: "", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "ON_TRIP", label: "On Trip" },
  { value: "IN_SHOP", label: "In Shop" },
];

const statusColors: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("vehicleType", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    api
      .get(`/dashboard?${params.toString()}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading || !data) {
    return <p className="text-slate-500">Loading...</p>;
  }

  const { vehicles, drivers, trips, costs, recentTrips } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setTypeFilter("")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${!typeFilter ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              All Types
            </button>
            {vehicleTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${typeFilter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
          >
            {statusFilters.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Focused KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard label="Active Vehicles" value={vehicles.active} sub={`${vehicles.onTrip} on trip`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Available" value={vehicles.available} sub={`of ${vehicles.total}`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="In Maintenance" value={vehicles.inShop} sub="vehicles" color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Active Trips" value={trips.active} sub={`${trips.pending} pending`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Pending Trips" value={trips.pending} sub="draft" color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Drivers On Duty" value={drivers.onDuty} sub={`of ${drivers.total}`} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Utilization" value={`${vehicles.utilizationPercent}%`} sub={`${vehicles.onTrip}/${vehicles.total} on trip`} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Recent Trips</h2>
          <a href="/dashboard/trips" className="text-xs text-blue-600 hover:underline">View all</a>
        </div>
        {recentTrips.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">No trips yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Trip #</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Route</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Vehicle</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Driver</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Cargo</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-600">
                    <a href={`/dashboard/trips/${t.id}`} className="hover:underline">{t.tripNumber}</a>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{t.source} → {t.destination}</td>
                  <td className="px-4 py-2.5 text-slate-700">{t.vehicleReg}</td>
                  <td className="px-4 py-2.5 text-slate-700">{t.driverName}</td>
                  <td className="px-4 py-2.5 text-slate-700">{t.cargoWeight.toLocaleString()} kg</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[t.status] || "bg-slate-100 text-slate-500"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Charts Section */}
      <DashboardCharts data={data} />
    </div>
  );
}

function StatCard({ label, value, sub, color, bg }: { label: string; value: number | string; sub?: string; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-lg p-4`}>
      <p className="text-xs text-slate-600">{label}</p>
      <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
