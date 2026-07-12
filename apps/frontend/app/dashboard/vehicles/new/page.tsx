"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVehicles } from "@/hooks/use-vehicles";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { VehicleStatus } from "@odoo-hackathon-26/shared";

const vehicleTypes = [
  { value: "Truck", label: "Truck" },
  { value: "Van", label: "Van" },
  { value: "Pickup", label: "Pickup" },
  { value: "Bus", label: "Bus" },
  { value: "Trailer", label: "Trailer" },
];

const statusOptions: { value: VehicleStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ON_TRIP", label: "On Trip" },
  { value: "IN_SHOP", label: "In Shop" },
  { value: "RETIRED", label: "Retired" },
];

export default function NewVehiclePage() {
  const router = useRouter();
  const { createVehicle } = useVehicles();

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [maxLoadCapacity, setMaxLoadCapacity] = useState("");
  const [odometer, setOdometer] = useState("0");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("AVAILABLE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createVehicle({
        registrationNumber,
        model,
        vehicleType,
        maxLoadCapacity: Number(maxLoadCapacity),
        odometer: Number(odometer),
        acquisitionCost: Number(acquisitionCost),
        status,
      });
      router.push("/dashboard/vehicles");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register Vehicle</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a new vehicle to the fleet
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          label="Registration Number"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          placeholder="e.g. KBZ 123A"
          required
        />
        <Input
          label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. Isuzu FRR 90"
          required
        />
        <Select
          label="Vehicle Type"
          options={vehicleTypes}
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          placeholder="Select type"
          required
        />
        <Input
          label="Max Load Capacity (kg)"
          type="number"
          value={maxLoadCapacity}
          onChange={(e) => setMaxLoadCapacity(e.target.value)}
          placeholder="e.g. 5000"
          required
        />
        <Input
          label="Odometer (km)"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Acquisition Cost"
          type="number"
          value={acquisitionCost}
          onChange={(e) => setAcquisitionCost(e.target.value)}
          placeholder="e.g. 2500000"
          required
        />
        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as VehicleStatus)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Register Vehicle
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
