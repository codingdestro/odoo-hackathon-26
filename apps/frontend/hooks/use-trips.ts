"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Trip, CreateTrip, UpdateTrip } from "@odoo-hackathon-26/shared";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/trips");
      setTrips(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = useCallback(async (data: CreateTrip) => {
    const res = await api.post("/trips", data);
    setTrips((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateTrip = useCallback(async (id: string, data: UpdateTrip) => {
    const res = await api.put(`/trips/${id}`, data);
    setTrips((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const dispatchTrip = useCallback(async (id: string) => {
    const res = await api.post(`/trips/${id}/dispatch`);
    setTrips((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const completeTrip = useCallback(async (id: string, endOdometer?: number, fuelConsumed?: number) => {
    const res = await api.post(`/trips/${id}/complete`, { endOdometer, fuelConsumed });
    setTrips((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const cancelTrip = useCallback(async (id: string) => {
    const res = await api.post(`/trips/${id}/cancel`);
    setTrips((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await api.delete(`/trips/${id}`);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trips, loading, error, fetchTrips, createTrip, updateTrip, dispatchTrip, completeTrip, cancelTrip, deleteTrip };
}
