"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVehicles } from "@/hooks/use-vehicles";
import { useDrivers } from "@/hooks/use-drivers";
import { useTrips } from "@/hooks/use-trips";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Vehicle, Driver } from "@odoo-hackathon-26/shared";

export default function NewTripPage() {
  const router = useRouter();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { drivers, loading: driversLoading } = useDrivers();
  const { createTrip } = useTrips();

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const selectedDriver = drivers.find((d) => d.id === driverId);

  const availableDrivers = drivers.filter((d) => {
    if (d.status === "SUSPENDED" || d.status === "ON_TRIP") return false;
    return new Date(d.licenseExpiry) >= new Date();
  });

  const validationErrors: string[] = [];

  if (cargoWeight && selectedVehicle && Number(cargoWeight) > selectedVehicle.maxLoadCapacity) {
    validationErrors.push(`Cargo weight (${Number(cargoWeight).toLocaleString()}kg) exceeds vehicle capacity (${selectedVehicle.maxLoadCapacity.toLocaleString()}kg)`);
  }

  if (selectedDriver) {
    if (selectedDriver.status === "SUSPENDED") validationErrors.push("Driver is suspended");
    if (selectedDriver.status === "ON_TRIP") validationErrors.push("Driver is already on a trip");
    if (new Date(selectedDriver.licenseExpiry) < new Date()) validationErrors.push("Driver license has expired");
  }

  if (selectedVehicle) {
    if (selectedVehicle.status !== "AVAILABLE") validationErrors.push("Vehicle is not available");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
      } as any);
      router.push("/dashboard/trips");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Trip</h1>
        <p className="text-sm text-slate-500 mt-1">Plan a new trip and dispatch when ready</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Nairobi" required />
          <Input label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Mombasa" required />
        </div>

        {vehiclesLoading ? (
          <p className="text-sm text-slate-500">Loading vehicles...</p>
        ) : (
          <Select
            label="Vehicle"
            options={availableVehicles.map((v) => ({ value: v.id, label: `${v.registrationNumber} — ${v.model} (${v.maxLoadCapacity.toLocaleString()}kg)` }))}
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="Select an available vehicle"
            required
          />
        )}

        {driversLoading ? (
          <p className="text-sm text-slate-500">Loading drivers...</p>
        ) : (
          <Select
            label="Driver"
            options={availableDrivers.map((d) => ({ value: d.id, label: `${d.name} — License: ${d.licenseNumber}` }))}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="Select an available driver"
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Cargo Weight (kg)" type="number" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} placeholder="e.g. 3000" required />
          <Input label="Planned Distance (km)" type="number" value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} placeholder="e.g. 480" required />
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 mb-1">Validation Warnings</p>
            <ul className="text-sm text-amber-700 space-y-0.5 list-disc list-inside">
              {validationErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Save as Draft
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
