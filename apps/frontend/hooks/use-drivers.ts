"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Driver, CreateDriver, UpdateDriver } from "@odoo-hackathon-26/shared";

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/drivers");
      setDrivers(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const createDriver = useCallback(async (data: CreateDriver) => {
    const res = await api.post("/drivers", data);
    setDrivers((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateDriver = useCallback(
    async (id: string, data: UpdateDriver) => {
      const res = await api.put(`/drivers/${id}`, data);
      setDrivers((prev) => prev.map((d) => (d.id === id ? res.data : d)));
      return res.data;
    },
    []
  );

  const deleteDriver = useCallback(async (id: string) => {
    await api.delete(`/drivers/${id}`);
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { drivers, loading, error, fetchDrivers, createDriver, updateDriver, deleteDriver };
}
