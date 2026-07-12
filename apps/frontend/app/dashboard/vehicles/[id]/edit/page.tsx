"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Vehicle, VehicleStatus } from "@odoo-hackathon-26/shared";

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

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [maxLoadCapacity, setMaxLoadCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("AVAILABLE");

  useEffect(() => {
    api
      .get(`/vehicles/${id}`)
      .then((res) => {
        const v: Vehicle = res.data;
        setRegistrationNumber(v.registrationNumber);
        setModel(v.model);
        setVehicleType(v.vehicleType);
        setMaxLoadCapacity(String(v.maxLoadCapacity));
        setOdometer(String(v.odometer));
        setAcquisitionCost(String(v.acquisitionCost));
        setStatus(v.status);
      })
      .catch(() => setError("Failed to load vehicle"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/vehicles/${id}`, {
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
      setError(err instanceof Error ? err.message : "Failed to update vehicle");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Vehicle</h1>
        <p className="text-sm text-slate-500 mt-1">{registrationNumber}</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          label="Registration Number"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          required
        />
        <Input
          label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <Select
          label="Vehicle Type"
          options={vehicleTypes}
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          required
        />
        <Input
          label="Max Load Capacity (kg)"
          type="number"
          value={maxLoadCapacity}
          onChange={(e) => setMaxLoadCapacity(e.target.value)}
          required
        />
        <Input
          label="Odometer (km)"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
        />
        <Input
          label="Acquisition Cost"
          type="number"
          value={acquisitionCost}
          onChange={(e) => setAcquisitionCost(e.target.value)}
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
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
