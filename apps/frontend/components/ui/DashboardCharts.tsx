"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardData {
  vehicles: { total: number; available: number; onTrip: number; inShop: number; retired: number; utilizationPercent: number };
  trips: { active: number; pending: number; completed: number; cancelled: number };
  costs: { totalFuel: number; totalMaintenance: number; totalExpenses: number };
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  const { vehicles } = data;

  const fleetStatusData = {
    labels: ["Available", "On Trip", "In Shop", "Retired"],
    datasets: [{
      data: [vehicles.available, vehicles.onTrip, vehicles.inShop, vehicles.retired],
      backgroundColor: ["#16a34a", "#2563eb", "#ca8a04", "#94a3b8"],
      borderWidth: 1,
    }],
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Fleet Status</h3>
        <div className="h-56">
          <Doughnut
            data={fleetStatusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 11 }, color: "#64748b" } },
              },
            }}
          />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Fleet Utilization</h3>
        <div className="flex flex-col items-center justify-center h-56">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke={vehicles.utilizationPercent > 70 ? "#16a34a" : vehicles.utilizationPercent > 40 ? "#2563eb" : "#ca8a04"}
                strokeWidth="3"
                strokeDasharray={`${vehicles.utilizationPercent} ${100 - vehicles.utilizationPercent}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{vehicles.utilizationPercent}%</p>
                <p className="text-xs text-slate-500">on trip</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">{vehicles.onTrip} of {vehicles.total} vehicles on trip</p>
        </div>
      </div>
    </div>
  );
}
