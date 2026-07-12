"use client";

import { useState } from "react";
import { useMaintenance } from "@/hooks/use-maintenance";
import { Button } from "@/components/ui/Button";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
};

export default function MaintenancePage() {
  const { logs, loading, completeLog, deleteLog } = useMaintenance();
  const [acting, setActing] = useState<string | null>(null);

  async function handleComplete(id: string) {
    if (!confirm("Complete this maintenance? Vehicle will be set to AVAILABLE.")) return;
    setActing(id);
    try {
      await completeLog(id);
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this maintenance record?")) return;
    setActing(id);
    try {
      await deleteLog(id);
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-sm text-slate-500 mt-1">{logs.length} record{logs.length !== 1 ? "s" : ""}</p>
        </div>
        <a href="/dashboard/maintenance/new">
          <Button>New Maintenance</Button>
        </a>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No maintenance records yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Vehicle ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Cost</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Start</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">End</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{l.title}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{l.vehicleId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-700">{l.maintenanceCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{l.startDate ? new Date(l.startDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{l.endDate ? new Date(l.endDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {l.status === "ACTIVE" && (
                        <button
                          onClick={() => handleComplete(l.id)}
                          disabled={acting === l.id}
                          className="text-sm text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                        >
                          {acting === l.id ? "..." : "Complete"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={acting === l.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {acting === l.id ? "..." : "Delete"}
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
