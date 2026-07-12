"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { Button } from "@/components/ui/Button";

export default function ExpensesPage() {
  const { expenses, summaries, loading, deleteExpense } = useExpenses();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    setDeleting(id);
    try {
      await deleteExpense(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</p>
        </div>
        <a href="/dashboard/expenses/new">
          <Button>Add Expense</Button>
        </a>
      </div>

      {!loading && summaries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-medium text-slate-700">Cost Summary per Vehicle</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-500">Vehicle</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Fuel</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Maintenance</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Other</th>
                <th className="text-right px-4 py-2 font-medium text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((s) => (
                <tr key={s.vehicleId} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-medium text-slate-900">{s.registrationNumber}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{s.fuelCost.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{s.maintenanceCost.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{s.otherExpenses.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-semibold text-blue-600">{s.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading ? (
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
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
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
  );
}
