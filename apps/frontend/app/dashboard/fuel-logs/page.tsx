"use client";

import { useState } from "react";
import { useFuelLogs } from "@/hooks/use-fuel-logs";
import { Button } from "@/components/ui/Button";

export default function FuelLogsPage() {
  const { logs, loading, deleteLog } = useFuelLogs();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this fuel log?")) return;
    setDeleting(id);
    try {
      await deleteLog(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fuel Logs</h1>
          <p className="text-sm text-slate-500 mt-1">{logs.length} log{logs.length !== 1 ? "s" : ""}</p>
        </div>
        <a href="/dashboard/fuel-logs/new">
          <Button>Log Fuel</Button>
        </a>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No fuel logs yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Vehicle</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Trip</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Liters</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Cost</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Odometer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Date</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{l.vehicleId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{l.tripId ? `${l.tripId.slice(0, 8)}...` : "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{l.liters.toLocaleString()} L</td>
                  <td className="px-4 py-3 text-slate-700">{l.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{l.odometer != null ? `${l.odometer.toLocaleString()} km` : "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{l.fuelDate}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={deleting === l.id}
                      className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === l.id ? "..." : "Delete"}
                    </button>
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
