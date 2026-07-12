"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Driver, DriverStatus } from "@odoo-hackathon-26/shared";

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

export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [safetyScore, setSafetyScore] = useState("");
  const [status, setStatus] = useState<DriverStatus>("AVAILABLE");

  useEffect(() => {
    api
      .get(`/drivers/${id}`)
      .then((res) => {
        const d: Driver = res.data;
        setName(d.name);
        setLicenseNumber(d.licenseNumber);
        setLicenseCategory(d.licenseCategory || "");
        setLicenseExpiry(d.licenseExpiry.split("T")[0]);
        setContactNumber(d.contactNumber || "");
        setSafetyScore(String(d.safetyScore));
        setStatus(d.status);
      })
      .catch(() => setError("Failed to load driver"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/drivers/${id}`, {
        name,
        licenseNumber,
        licenseCategory: licenseCategory || undefined,
        licenseExpiry: new Date(licenseExpiry).toISOString(),
        contactNumber: contactNumber || undefined,
        safetyScore: Number(safetyScore),
        status,
      });
      router.push("/dashboard/drivers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update driver");
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Driver</h1>
        <p className="text-sm text-slate-500 mt-1">{name}</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
        <Select label="License Category" options={categoryOptions} value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} />
        <Input label="License Expiry" type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} required />
        <Input label="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
        <Input label="Safety Score" type="number" value={safetyScore} onChange={(e) => setSafetyScore(e.target.value)} required />
        <Select label="Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as DriverStatus)} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>Save Changes</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
