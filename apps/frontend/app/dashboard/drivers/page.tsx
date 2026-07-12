"use client";

import { useState } from "react";
import Link from "next/link";
import { useDrivers } from "@/hooks/use-drivers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { Driver, DriverStatus } from "@odoo-hackathon-26/shared";

const statusOptions: DriverStatus[] = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];

export default function DriversPage() {
  const { drivers, loading, updateDriver, deleteDriver } = useDrivers();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this driver?")) return;
    setDeleting(id);
    try {
      await deleteDriver(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  async function handleStatusChange(driver: Driver, newStatus: DriverStatus) {
    setStatusUpdating(driver.id);
    try {
      await updateDriver(driver.id, {
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseCategory: driver.licenseCategory || undefined,
        licenseExpiry: driver.licenseExpiry,
        contactNumber: driver.contactNumber || undefined,
        safetyScore: driver.safetyScore,
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-500 mt-1">
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/drivers/new">
          <Button>Add Driver</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : drivers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No drivers yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">License #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Expiry</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Score</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                  <td className="px-4 py-3 text-slate-700">{d.licenseNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{d.licenseCategory || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(d.licenseExpiry).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{d.safetyScore}</td>
                  <td className="px-4 py-3">
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusChange(d, e.target.value as DriverStatus)}
                      disabled={statusUpdating === d.id}
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
                        href={`/dashboard/drivers/${d.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting === d.id ? "..." : "Delete"}
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
