"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles } from "@/hooks/use-vehicles";
import { useMaintenance } from "@/hooks/use-maintenance";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function NewMaintenancePage() {
  const router = useRouter();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { createLog } = useMaintenance();

  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const eligibleVehicles = vehicles.filter((v) => v.status !== "ON_TRIP" && v.status !== "RETIRED");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createLog({
        vehicleId,
        title,
        description: description || undefined,
        maintenanceCost: Number(maintenanceCost),
      } as any);
      router.push("/dashboard/maintenance");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create maintenance record");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Maintenance</h1>
        <p className="text-sm text-slate-500 mt-1">Create a maintenance record — vehicle will be set to IN_SHOP</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {vehiclesLoading ? (
          <p className="text-sm text-slate-500">Loading vehicles...</p>
        ) : (
          <Select
            label="Vehicle"
            options={eligibleVehicles.map((v) => ({
              value: v.id,
              label: `${v.registrationNumber} — ${v.model} (${v.status === "IN_SHOP" ? "Already in shop" : v.status})`,
            }))}
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="Select a vehicle"
            required
          />
        )}

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Engine Overhaul"
          required
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details about the maintenance work..."
        />

        <Input
          label="Cost"
          type="number"
          value={maintenanceCost}
          onChange={(e) => setMaintenanceCost(e.target.value)}
          placeholder="e.g. 5000"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Create & Set to IN_SHOP
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
