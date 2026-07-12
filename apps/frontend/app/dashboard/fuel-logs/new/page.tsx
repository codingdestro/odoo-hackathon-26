"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles } from "@/hooks/use-vehicles";
import { useTrips } from "@/hooks/use-trips";
import { useFuelLogs } from "@/hooks/use-fuel-logs";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function NewFuelLogPage() {
  const router = useRouter();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { trips, loading: tripsLoading } = useTrips();
  const { createLog } = useFuelLogs();

  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [liters, setLiters] = useState("");
  const [amount, setAmount] = useState("");
  const [odometer, setOdometer] = useState("");
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredTrips = vehicleId ? trips.filter((t) => t.vehicleId === vehicleId) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createLog({
        vehicleId,
        tripId: tripId || undefined,
        liters: Number(liters),
        amount: Number(amount),
        fuelDate,
        odometer: odometer ? Number(odometer) : undefined,
      } as any);
      router.push("/dashboard/fuel-logs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to log fuel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Log Fuel</h1>
        <p className="text-sm text-slate-500 mt-1">Record a fuel purchase for a vehicle</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {vehiclesLoading ? (
          <p className="text-sm text-slate-500">Loading vehicles...</p>
        ) : (
          <Select
            label="Vehicle"
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.registrationNumber} — ${v.model}`,
            }))}
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
            options={filteredTrips.map((t) => ({
              value: t.id,
              label: `${t.tripNumber} — ${t.source} → ${t.destination}`,
            }))}
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            placeholder="No trip"
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Liters"
            type="number"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            placeholder="e.g. 50"
            required
          />
          <Input
            label="Cost"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 7500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Odometer (km)"
            type="number"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="e.g. 45200"
          />
          <Input
            label="Fuel Date"
            type="date"
            value={fuelDate}
            onChange={(e) => setFuelDate(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Save Fuel Log
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
