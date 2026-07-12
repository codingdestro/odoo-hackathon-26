import type { VehicleStatus, DriverStatus } from "@odoo-hackathon-26/shared";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  ON_TRIP: "bg-blue-100 text-blue-800",
  IN_SHOP: "bg-amber-100 text-amber-800",
  RETIRED: "bg-slate-100 text-slate-500",
  OFF_DUTY: "bg-orange-100 text-orange-800",
  SUSPENDED: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: VehicleStatus | DriverStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[status] || "bg-slate-100 text-slate-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
