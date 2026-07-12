"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { FuelLog, CreateFuelLog, UpdateFuelLog } from "@odoo-hackathon-26/shared";

export function useFuelLogs() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/fuel-logs");
      setLogs(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch fuel logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const createLog = useCallback(async (data: CreateFuelLog) => {
    const res = await api.post("/fuel-logs", data);
    setLogs((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateLog = useCallback(async (id: string, data: UpdateFuelLog) => {
    const res = await api.put(`/fuel-logs/${id}`, data);
    setLogs((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    return res.data;
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await api.delete(`/fuel-logs/${id}`);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { logs, loading, error, fetchLogs, createLog, updateLog, deleteLog };
}
