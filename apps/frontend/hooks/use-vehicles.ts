"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Vehicle, CreateVehicle, UpdateVehicle } from "@odoo-hackathon-26/shared";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = useCallback(
    async (data: CreateVehicle) => {
      const res = await api.post("/vehicles", data);
      setVehicles((prev) => [...prev, res.data]);
      return res.data;
    },
    []
  );

  const updateVehicle = useCallback(
    async (id: string, data: UpdateVehicle) => {
      const res = await api.put(`/vehicles/${id}`, data);
      setVehicles((prev) => prev.map((v) => (v.id === id ? res.data : v)));
      return res.data;
    },
    []
  );

  const deleteVehicle = useCallback(async (id: string) => {
    await api.delete(`/vehicles/${id}`);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return { vehicles, loading, error, fetchVehicles, createVehicle, updateVehicle, deleteVehicle };
}
