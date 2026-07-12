"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Vehicle, Driver } from "@odoo-hackathon-26/shared";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/vehicles"), api.get("/drivers")])
      .then(([vRes, dRes]) => {
        setVehicles(vRes.data);
        setDrivers(dRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const availableDrivers = drivers.filter((d) => d.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Vehicles</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{vehicles.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-500">Available Vehicles</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{availableVehicles}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Drivers</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{drivers.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-500">Available Drivers</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{availableDrivers}</p>
          </div>
        </div>
      )}
    </div>
  );
}
