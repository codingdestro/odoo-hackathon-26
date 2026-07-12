"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Expense, CreateExpense, UpdateExpense } from "@odoo-hackathon-26/shared";

interface CostSummary {
  vehicleId: string;
  registrationNumber: string;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summaries, setSummaries] = useState<CostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const [expRes, sumRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/expenses/summaries"),
      ]);
      setExpenses(expRes.data);
      setSummaries(sumRes.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = useCallback(async (data: CreateExpense) => {
    const res = await api.post("/expenses", data);
    setExpenses((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateExpense = useCallback(async (id: string, data: UpdateExpense) => {
    const res = await api.put(`/expenses/${id}`, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    return res.data;
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await api.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { expenses, summaries, loading, error, fetchExpenses, createExpense, updateExpense, deleteExpense };
}
