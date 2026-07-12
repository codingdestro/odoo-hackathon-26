"use client";

import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#0891b2"];

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
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  const { vehicles, drivers, trips, costs } = data;

  const vehicleStatusData = {
    labels: ["Available", "On Trip", "In Shop", "Retired"],
    datasets: [
      {
        data: [vehicles.available, vehicles.onTrip, vehicles.inShop, vehicles.retired],
        backgroundColor: ["#16a34a", "#2563eb", "#ca8a04", "#94a3b8"],
        borderWidth: 1,
      },
    ],
  };

  const vehicleTypeData = {
    labels: vehicles.byType.map((t) => t.vehicleType),
    datasets: [
      {
        label: "Vehicles by Type",
        data: vehicles.byType.map((t) => t.count),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const driverStatusData = {
    labels: ["Available", "On Duty", "Off Duty", "Suspended"],
    datasets: [
      {
        data: [drivers.available, drivers.onDuty, drivers.offDuty, drivers.suspended],
        backgroundColor: ["#16a34a", "#2563eb", "#94a3b8", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  const tripStatusData = {
    labels: ["Active", "Pending", "Completed", "Cancelled"],
    datasets: [
      {
        data: [trips.active, trips.pending, trips.completed, trips.cancelled],
        backgroundColor: ["#2563eb", "#ca8a04", "#16a34a", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  const costBreakdownData = {
    labels: ["Fuel", "Maintenance", "Other"],
    datasets: [
      {
        data: [costs.totalFuel, costs.totalMaintenance, costs.totalExpenses],
        backgroundColor: ["#2563eb", "#ca8a04", "#7c3aed"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11 },
          color: "#64748b",
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Visuals & Analysis</h2>

      {/* Row 1: Vehicle Status + Driver Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Vehicle Status</h3>
          <div className="h-64">
            <Doughnut data={vehicleStatusData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Driver Status</h3>
          <div className="h-64">
            <Doughnut data={driverStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Vehicle by Type + Trip Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Vehicles by Type</h3>
          <div className="h-64">
            <Bar
              data={vehicleTypeData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: "#f1f5f9" },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Trip Status</h3>
          <div className="h-64">
            <Pie data={tripStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Row 3: Cost Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Cost Breakdown</h3>
          <div className="h-64">
            <Doughnut data={costBreakdownData} options={chartOptions} />
          </div>
        </div>

        {/* Utilization Gauge */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Fleet Utilization</h3>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
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
            <p className="text-xs text-slate-400 mt-3">
              {vehicles.onTrip} of {vehicles.total} vehicles on trip
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
