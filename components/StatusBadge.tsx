import clsx from "clsx";
import { AlertTriangle, Check, Clock, X } from "lucide-react";
import type { TxStatus } from "@/lib/types";

const MAP: Record<TxStatus, { label: string; icon: typeof Check; cls: string }> = {
  success: { label: "Succès", icon: Check, cls: "text-emerald-700" },
  pending: { label: "En attente", icon: Clock, cls: "text-amber-600" },
  failed: { label: "Échoué", icon: X, cls: "text-red-600" },
  not_collected: { label: "Non collecté", icon: AlertTriangle, cls: "text-slate-600" },
};

export const STATUS_LABELS = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [k, v.label])) as Record<TxStatus, string>;

export function StatusBadge({ status }: { status: TxStatus }) {
  const s = MAP[status];
  const Icon = s.icon;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-sm font-medium", s.cls)}>
      <Icon className="h-4 w-4" />
      {s.label}
    </span>
  );
}

export function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "slate" | "amber" | "brand" | "red" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "green" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        tone === "slate" && "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
        tone === "amber" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        tone === "brand" && "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
        tone === "red" && "bg-red-50 text-red-700 ring-1 ring-red-200"
      )}
    >
      {children}
    </span>
  );
}
