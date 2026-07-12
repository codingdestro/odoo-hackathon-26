"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useTrips } from "@/hooks/use-trips";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Trip, Vehicle, Driver } from "@odoo-hackathon-26/shared";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  DISPATCHED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { dispatchTrip, completeTrip, cancelTrip } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const [endOdometer, setEndOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  useEffect(() => {
    loadTrip();
  }, [id]);

  async function loadTrip() {
    setLoading(true);
    try {
      const res = await api.get(`/trips/${id}`);
      const t: Trip = res.data;
      setTrip(t);
      const [vRes, dRes] = await Promise.all([
        api.get(`/vehicles/${t.vehicleId}`),
        api.get(`/drivers/${t.driverId}`),
      ]);
      setVehicle(vRes.data);
      setDriver(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDispatch() {
    if (!confirm("Dispatch this trip? Vehicle and driver will be set to ON_TRIP.")) return;
    setActing(true);
    setError("");
    try {
      await dispatchTrip(id);
      await loadTrip();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setActing(false);
    }
  }

  async function handleComplete() {
    if (!confirm("Complete this trip? Vehicle and driver will be set to AVAILABLE.")) return;
    setActing(true);
    setError("");
    try {
      await completeTrip(id, endOdometer ? Number(endOdometer) : undefined, fuelConsumed ? Number(fuelConsumed) : undefined);
      await loadTrip();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Complete failed");
    } finally {
      setActing(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this trip? Vehicle and driver will be set to AVAILABLE.")) return;
    setActing(true);
    setError("");
    try {
      await cancelTrip(id);
      await loadTrip();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActing(false);
    }
  }

  if (loading || !trip) {
    return <p className="text-slate-500">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trip {trip.tripNumber}</h1>
          <p className="text-sm text-slate-500 mt-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[trip.status]}`}>
              {trip.status}
            </span>
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/dashboard/trips")}>
          Back to Trips
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="font-medium text-slate-900 mb-4">Trip Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Source</dt>
                <dd className="text-slate-900 font-medium">{trip.source}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Destination</dt>
                <dd className="text-slate-900 font-medium">{trip.destination}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Cargo Weight</dt>
                <dd className="text-slate-900 font-medium">{trip.cargoWeight.toLocaleString()} kg</dd>
              </div>
              <div>
                <dt className="text-slate-500">Planned Distance</dt>
                <dd className="text-slate-900 font-medium">{trip.plannedDistance.toLocaleString()} km</dd>
              </div>
              {trip.actualDistance && (
                <div>
                  <dt className="text-slate-500">Actual Distance</dt>
                  <dd className="text-slate-900 font-medium">{trip.actualDistance.toLocaleString()} km</dd>
                </div>
              )}
              {trip.fuelConsumed != null && (
                <div>
                  <dt className="text-slate-500">Fuel Consumed</dt>
                  <dd className="text-slate-900 font-medium">{trip.fuelConsumed.toLocaleString()} L</dd>
                </div>
              )}
              {trip.dispatchedAt && (
                <div>
                  <dt className="text-slate-500">Dispatched</dt>
                  <dd className="text-slate-900 font-medium">{new Date(trip.dispatchedAt).toLocaleString()}</dd>
                </div>
              )}
              {trip.completedAt && (
                <div>
                  <dt className="text-slate-500">Completed</dt>
                  <dd className="text-slate-900 font-medium">{new Date(trip.completedAt).toLocaleString()}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-900 font-medium">{new Date(trip.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {/* Complete Trip Panel */}
          {trip.status === "DISPATCHED" && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="font-medium text-slate-900 mb-4">Complete Trip</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  label="Final Odometer (km)"
                  type="number"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  placeholder="e.g. 55780"
                />
                <Input
                  label="Fuel Consumed (L)"
                  type="number"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  placeholder="e.g. 85"
                />
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Vehicle and driver will be set to AVAILABLE.
              </p>
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
              <Button onClick={handleComplete} disabled={acting}>
                {acting ? "Completing..." : "Complete Trip"}
              </Button>
            </div>
          )}

          {/* Cancel Trip Panel */}
          {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (
            <div className="bg-white border border-rose-200 rounded-lg p-6">
              <h2 className="font-medium text-rose-700 mb-2">Cancel Trip</h2>
              <p className="text-sm text-slate-500 mb-4">
                {trip.status === "DISPATCHED"
                  ? "Vehicle and driver will be set back to AVAILABLE."
                  : "Trip will be cancelled."}
              </p>
              <Button variant="danger" onClick={handleCancel} disabled={acting}>
                {acting ? "Cancelling..." : "Cancel Trip"}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar: Vehicle & Driver Info + Dispatch */}
        <div className="space-y-4">
          {vehicle && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Vehicle</h3>
              <p className="text-sm text-slate-700">{vehicle.registrationNumber}</p>
              <p className="text-sm text-slate-500">{vehicle.model} • {vehicle.vehicleType}</p>
              <p className="text-sm text-slate-500">Capacity: {vehicle.maxLoadCapacity.toLocaleString()} kg</p>
              <p className="text-sm text-slate-500">Odometer: {vehicle.odometer.toLocaleString()} km</p>
            </div>
          )}

          {driver && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Driver</h3>
              <p className="text-sm text-slate-700 font-medium">{driver.name}</p>
              <p className="text-sm text-slate-500">License: {driver.licenseNumber} {driver.licenseCategory && `(${driver.licenseCategory})`}</p>
              <p className="text-sm text-slate-500">Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}</p>
              <p className="text-sm text-slate-500">Safety: {driver.safetyScore}</p>
            </div>
          )}

          {trip.status === "DRAFT" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Ready to Dispatch</h3>
              <p className="text-sm text-blue-600 mb-3">
                This will set vehicle and driver to ON_TRIP.
              </p>
              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
              <Button onClick={handleDispatch} disabled={acting}>
                {acting ? "Dispatching..." : "Dispatch Trip"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
