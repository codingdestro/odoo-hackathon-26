"use client";

import { useState } from "react";
import { useFuelLogs } from "@/hooks/use-fuel-logs";
import { useExpenses } from "@/hooks/use-expenses";
import { Button } from "@/components/ui/Button";

type Tab = "summary" | "fuel" | "expenses";

export default function FuelExpensesPage() {
  const { logs, loading: fuelLoading, deleteLog } = useFuelLogs();
  const { expenses, summaries, loading: expLoading, deleteExpense } = useExpenses();
  const [tab, setTab] = useState<Tab>("summary");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDeleteFuel(id: string) {
    if (!confirm("Delete this fuel log?")) return;
    setDeleting(id);
    try { await deleteLog(id); } catch (err) { console.error(err); } finally { setDeleting(null); }
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    setDeleting(id);
    try { await deleteExpense(id); } catch (err) { console.error(err); } finally { setDeleting(null); }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "summary", label: "Cost Summary" },
    { key: "fuel", label: "Fuel Logs" },
    { key: "expenses", label: "Expenses" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fuel & Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Track fuel and operational costs</p>
        </div>
        <div className="flex gap-2">
          <a href="/dashboard/fuel-logs/new"><Button variant="secondary">+ Fuel</Button></a>
          <a href="/dashboard/expenses/new"><Button>+ Expense</Button></a>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div>
          {expLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : summaries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-slate-500">No data yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Vehicle</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Fuel</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Maintenance</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Other</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaries.map((s) => (
                    <tr key={s.vehicleId} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{s.registrationNumber}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{s.fuelCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{s.maintenanceCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{s.otherExpenses.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{s.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "fuel" && (
        <div>
          {fuelLoading ? (
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
                        <button onClick={() => handleDeleteFuel(l.id)} disabled={deleting === l.id} className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50">
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
      )}

      {tab === "expenses" && (
        <div>
          {expLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : expenses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-slate-500">No expenses yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Vehicle</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Trip</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Date</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{e.expenseType}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{e.vehicleId.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{e.tripId ? `${e.tripId.slice(0, 8)}...` : "—"}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{e.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-700">{e.expenseDate || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteExpense(e.id)} disabled={deleting === e.id} className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50">
                          {deleting === e.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
