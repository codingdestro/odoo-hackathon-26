"use client";

import { useState } from "react";
import Link from "next/link";
import { useVehicles } from "@/hooks/use-vehicles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { Vehicle, VehicleStatus } from "@odoo-hackathon-26/shared";

const statusOptions: VehicleStatus[] = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];

export default function VehiclesPage() {
  const { vehicles, loading, updateVehicle, deleteVehicle } = useVehicles();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    setDeleting(id);
    setActionError(null);
    try {
      await deleteVehicle(id);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  async function handleStatusChange(vehicle: Vehicle, newStatus: VehicleStatus) {
    setStatusUpdating(vehicle.id);
    setActionError(null);
    try {
      await updateVehicle(vehicle.id, {
        registrationNumber: vehicle.registrationNumber,
        model: vehicle.model,
        vehicleType: vehicle.vehicleType,
        maxLoadCapacity: vehicle.maxLoadCapacity,
        odometer: vehicle.odometer,
        acquisitionCost: vehicle.acquisitionCost,
        status: newStatus,
      });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setStatusUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>Add Vehicle</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : vehicles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No vehicles yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Reg #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Model</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Capacity</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Odometer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{v.registrationNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{v.model}</td>
                  <td className="px-4 py-3 text-slate-700">{v.vehicleType}</td>
                  <td className="px-4 py-3 text-slate-700">{v.maxLoadCapacity.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-slate-700">{v.odometer.toLocaleString()} km</td>
                  <td className="px-4 py-3">
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v, e.target.value as VehicleStatus)}
                      disabled={statusUpdating === v.id}
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 disabled:opacity-50"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/vehicles/${v.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deleting === v.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting === v.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
