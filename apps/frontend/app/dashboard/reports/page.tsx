"use client";

import { useReports } from "@/hooks/use-reports";
import { Button } from "@/components/ui/Button";

const roiColor = (roi: number) =>
  roi >= 0.2 ? "text-emerald-600" : roi >= 0 ? "text-blue-600" : "text-rose-600";

export default function ReportsPage() {
  const { data, loading, error } = useReports();

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
        <p className="text-rose-700 font-medium">Failed to load reports</p>
        <p className="text-sm text-rose-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-500">No data available.</p>;
  }

  const avgRoi = data.vehicleReports.length > 0
    ? data.vehicleReports.reduce((s, r) => s + r.roi, 0) / data.vehicleReports.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports &amp; Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Fleet performance and cost analysis</p>
        </div>
        <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/reports/export/csv`}>
          <Button variant="secondary">Export CSV</Button>
        </a>
      </div>

      {/* Fleet KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Utilization" value={`${data.utilizationPercent}%`} />
        <StatCard label="Avg Fuel Eff." value={`${data.avgFuelEfficiency} km/L`} />
        <StatCard label="Total Revenue" value={data.totalRevenue.toLocaleString()} />
        <StatCard label="Op. Cost" value={data.totalOperationalCost.toLocaleString()} />
        <StatCard label="Net" value={(data.totalRevenue - data.totalOperationalCost).toLocaleString()} />
        <StatCard label="Avg ROI" value={`${(avgRoi * 100).toFixed(1)}%`} />
      </div>

      {/* Vehicle Report Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-medium text-slate-700">Vehicle Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Vehicle</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Model</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Type</th>
                <th className="text-center px-4 py-2.5 font-medium text-slate-500">Trips</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500">Distance</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500">Fuel Eff.</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500">Revenue</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500">Op. Cost</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.vehicleReports.map((r) => (
                <tr key={r.registrationNumber} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{r.registrationNumber}</td>
                  <td className="px-4 py-2.5 text-slate-700">{r.model}</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.vehicleType}</td>
                  <td className="px-4 py-2.5 text-center text-slate-700">{r.totalTrips}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{r.totalDistance.toLocaleString()} km</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{r.fuelEfficiency} km/L</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{r.totalRevenue.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{r.operationalCost.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${roiColor(r.roi)}`}>
                    {(r.roi * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              {data.vehicleReports.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">No vehicle data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <CostBar label="Fuel" value={data.totalFuelCost} total={data.totalOperationalCost} color="bg-blue-500" />
            <CostBar label="Maintenance" value={data.totalMaintenanceCost} total={data.totalOperationalCost} color="bg-amber-500" />
            <CostBar label="Other" value={data.totalExpenses} total={data.totalOperationalCost} color="bg-violet-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Top Performers by ROI</h3>
          <div className="space-y-2">
            {[...data.vehicleReports]
              .sort((a, b) => b.roi - a.roi)
              .slice(0, 5)
              .map((r, i) => (
                <div key={r.registrationNumber} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    <span className="text-slate-400 mr-2">#{i + 1}</span>
                    {r.registrationNumber}
                  </span>
                  <span className={`font-semibold ${roiColor(r.roi)}`}>{(r.roi * 100).toFixed(1)}%</span>
                </div>
              ))}
            {data.vehicleReports.length === 0 && (
              <p className="text-sm text-slate-500">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span>{value.toLocaleString()} ({pct}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
