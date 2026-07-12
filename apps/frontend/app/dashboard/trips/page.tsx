"use client";

import { useState } from "react";
import Link from "next/link";
import { useTrips } from "@/hooks/use-trips";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  DISPATCHED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

function TripStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

export default function TripsPage() {
  const { trips, loading, dispatchTrip, deleteTrip } = useTrips();
  const [acting, setActing] = useState<string | null>(null);

  async function handleDispatch(id: string) {
    if (!confirm("Dispatch this trip? Vehicle and driver will be set to ON_TRIP.")) return;
    setActing(id);
    try {
      await dispatchTrip(id);
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this trip?")) return;
    setActing(id);
    try {
      await deleteTrip(id);
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
          <h1 className="text-2xl font-bold text-slate-900">Trips</h1>
          <p className="text-sm text-slate-500 mt-1">{trips.length} trip{trips.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/trips/new">
          <Button>Create Trip</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : trips.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No trips yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Trip #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Route</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Cargo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Distance</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">{t.tripNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{t.source} → {t.destination}</td>
                  <td className="px-4 py-3 text-slate-700">{t.cargoWeight.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-slate-700">{t.plannedDistance.toLocaleString()} km</td>
                  <td className="px-4 py-3"><TripStatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/trips/${t.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                        View
                      </Link>
                      {t.status === "DRAFT" && (
                        <button
                          onClick={() => handleDispatch(t.id)}
                          disabled={acting === t.id}
                          className="text-sm text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                        >
                          {acting === t.id ? "..." : "Dispatch"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={acting === t.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {acting === t.id ? "..." : "Delete"}
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
