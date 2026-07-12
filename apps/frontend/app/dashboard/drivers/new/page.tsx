"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDrivers } from "@/hooks/use-drivers";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { DriverStatus } from "@odoo-hackathon-26/shared";

const statusOptions: { value: DriverStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ON_TRIP", label: "On Trip" },
  { value: "OFF_DUTY", label: "Off Duty" },
  { value: "SUSPENDED", label: "Suspended" },
];

const categoryOptions = [
  { value: "A", label: "A - Motorcycle" },
  { value: "B", label: "B - Light Vehicle" },
  { value: "C", label: "C - Heavy Vehicle" },
  { value: "D", label: "D - Bus" },
  { value: "E", label: "E - Combination" },
];

export default function NewDriverPage() {
  const router = useRouter();
  const { createDriver } = useDrivers();

  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [status, setStatus] = useState<DriverStatus>("AVAILABLE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createDriver({
        name,
        licenseNumber,
        licenseCategory: licenseCategory || undefined,
        licenseExpiry: new Date(licenseExpiry).toISOString(),
        contactNumber: contactNumber || undefined,
        safetyScore: 100,
        status,
      });
      router.push("/dashboard/drivers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create driver");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Driver</h1>
        <p className="text-sm text-slate-500 mt-1">Add a new driver to the fleet</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Mwangi"
          required
        />
        <Input
          label="License Number"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="e.g. DL-12345678"
          required
        />
        <Select
          label="License Category"
          options={categoryOptions}
          value={licenseCategory}
          onChange={(e) => setLicenseCategory(e.target.value)}
          placeholder="Select category"
        />
        <Input
          label="License Expiry"
          type="date"
          value={licenseExpiry}
          onChange={(e) => setLicenseExpiry(e.target.value)}
          required
        />
        <Input
          label="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="e.g. +254 712 345 678"
        />
        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as DriverStatus)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Add Driver
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
