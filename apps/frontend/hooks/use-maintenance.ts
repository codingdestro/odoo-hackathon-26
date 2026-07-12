"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { MaintenanceLog, CreateMaintenanceLog, UpdateMaintenanceLog } from "@odoo-hackathon-26/shared";

export function useMaintenance() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/maintenance");
      setLogs(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch maintenance logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const createLog = useCallback(async (data: CreateMaintenanceLog) => {
    const res = await api.post("/maintenance", data);
    setLogs((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateLog = useCallback(async (id: string, data: UpdateMaintenanceLog) => {
    const res = await api.put(`/maintenance/${id}`, data);
    setLogs((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    return res.data;
  }, []);

  const completeLog = useCallback(async (id: string, endDate?: string) => {
    const res = await api.post(`/maintenance/${id}/complete`, { endDate });
    setLogs((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    return res.data;
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await api.delete(`/maintenance/${id}`);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { logs, loading, error, fetchLogs, createLog, updateLog, completeLog, deleteLog };
}
