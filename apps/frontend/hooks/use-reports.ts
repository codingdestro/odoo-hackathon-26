"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface VehicleReport {
  registrationNumber: string;
  model: string;
  vehicleType: string;
  status: string;
  totalTrips: number;
  totalDistance: number;
  totalFuelConsumed: number;
  fuelEfficiency: number;
  totalRevenue: number;
  maintenanceCost: number;
  fuelCost: number;
  otherExpenses: number;
  operationalCost: number;
  acquisitionCost: number;
  roi: number;
}

interface FleetAnalytics {
  utilizationPercent: number;
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpenses: number;
  totalOperationalCost: number;
  avgFuelEfficiency: number;
  vehicleReports: VehicleReport[];
}

export function useReports() {
  const [data, setData] = useState<FleetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/analytics");
      setData(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, fetchReports };
}
