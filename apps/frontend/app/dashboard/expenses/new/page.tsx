"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles } from "@/hooks/use-vehicles";
import { useTrips } from "@/hooks/use-trips";
import { useExpenses } from "@/hooks/use-expenses";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const expenseTypes = [
  { value: "Toll", label: "Toll" },
  { value: "Parking", label: "Parking" },
  { value: "Repair", label: "Repair" },
  { value: "Insurance", label: "Insurance" },
  { value: "Permit", label: "Permit" },
  { value: "Salary", label: "Salary" },
  { value: "Other", label: "Other" },
];

export default function NewExpensePage() {
  const router = useRouter();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { trips, loading: tripsLoading } = useTrips();
  const { createExpense } = useExpenses();

  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredTrips = vehicleId ? trips.filter((t) => t.vehicleId === vehicleId) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createExpense({
        vehicleId,
        tripId: tripId || undefined,
        expenseType,
        amount: Number(amount),
        description: description || undefined,
        expenseDate,
      } as any);
      router.push("/dashboard/expenses");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-sm text-slate-500 mt-1">Record an operational expense for a vehicle</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {vehiclesLoading ? (
          <p className="text-sm text-slate-500">Loading vehicles...</p>
        ) : (
          <Select
            label="Vehicle"
            options={vehicles.map((v) => ({ value: v.id, label: `${v.registrationNumber} — ${v.model}` }))}
            value={vehicleId}
            onChange={(e) => { setVehicleId(e.target.value); setTripId(""); }}
            placeholder="Select a vehicle"
            required
          />
        )}

        {tripsLoading ? (
          <p className="text-sm text-slate-500">Loading trips...</p>
        ) : (
          <Select
            label="Trip (optional)"
            options={filteredTrips.map((t) => ({ value: t.id, label: `${t.tripNumber} — ${t.source} → ${t.destination}` }))}
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            placeholder="No trip"
          />
        )}

        <Select
          label="Expense Type"
          options={expenseTypes}
          value={expenseType}
          onChange={(e) => setExpenseType(e.target.value)}
          placeholder="Select type"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2500"
            required
          />
          <Input
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </div>

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Highway toll at Rironi"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Save Expense
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
