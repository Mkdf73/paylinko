"use client";

import clsx from "clsx";
import { ArrowDownToLine, ArrowUpRight, Calendar, CreditCard, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { WithdrawModal } from "@/components/WithdrawModal";
import { COUNTRY_BY_CODE } from "@/lib/countries";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { computeBalance, useStore } from "@/lib/store";

const DAY = 864e5;
const PRESETS = [
  { key: "7", label: "7 derniers jours", days: 7 },
  { key: "30", label: "30 derniers jours", days: 30 },
  { key: "90", label: "3 derniers mois", days: 90 },
  { key: "365", label: "12 derniers mois", days: 365 },
  { key: "custom", label: "Personnalisé", days: 0 },
];

function toInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const txs = useStore((s) => s.transactions);
  const profile = useStore((s) => s.profile);
  const [preset, setPreset] = useState("30");
  const [from, setFrom] = useState(toInput(new Date(Date.now() - 7 * DAY)));
  const [to, setTo] = useState(toInput(new Date()));
  const [chartRange, setChartRange] = useState<"year" | "month">("year");
  const [withdraw, setWithdraw] = useState(false);

  const range = useMemo(() => {
    if (preset === "custom") return { start: new Date(from).getTime(), end: new Date(to).getTime() + DAY };
    const days = PRESETS.find((p) => p.key === preset)!.days;
    const end = Date.now();
    return { start: end - days * DAY, end };
  }, [preset, from, to]);

  const incoming = txs.filter((t) => t.direction === "in");
  const inRange = (start: number, end: number) =>
    incoming.filter((t) => {
      const d = new Date(t.date).getTime();
      return d >= start && d < end;
    });

  const current = inRange(range.start, range.end);
  const previous = inRange(range.start - (range.end - range.start), range.start);
  const revenue = current.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const prevRevenue = previous.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const successCount = current.filter((t) => t.status === "success").length;
  const pending = current.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const growth = prevRevenue === 0 ? (revenue > 0 ? 100 : 0) : ((revenue - prevRevenue) / prevRevenue) * 100;
  const conversion = current.length ? Math.round((successCount / current.length) * 100) : 0;
  const balance = computeBalance(txs);

  const chartData = useMemo(() => {
    const success = incoming.filter((t) => t.status === "success");
    if (chartRange === "year") {
      const now = new Date();
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const total = success.filter((t) => {
          const x = new Date(t.date);
          return x >= d && x < next;
        }).reduce((s, t) => s + t.amount, 0);
        return { label: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d).replace(".", ""), total };
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today.getTime() - (29 - i) * DAY);
      const total = success.filter((t) => {
        const x = new Date(t.date).getTime();
        return x >= d.getTime() && x < d.getTime() + DAY;
      }).reduce((s, t) => s + t.amount, 0);
      return { label: String(d.getDate()), total };
    });
  }, [incoming, chartRange]);

  const recent = current.filter((t) => t.status === "success").slice(0, 6);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bonjour ${profile.firstName} 👋 Une vue d'ensemble de votre activité sur Paylinko.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Select value={preset} onChange={(e) => setPreset(e.target.value)} className="h-10 !w-auto pl-9">
                {PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            {preset === "custom" && (
              <div className="flex items-center gap-1.5">
                <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="h-10 w-auto" />
                <span className="text-slate-400">→</span>
                <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="h-10 w-auto" />
              </div>
            )}
          </div>
        }
      />

      {/* Solde + actions rapides */}
      <div className="mb-5 overflow-hidden rounded-3xl bg-ink p-5 text-white sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <Wallet className="h-4 w-4" /> Solde disponible
            </p>
            <p className="tabular mt-1 font-display text-3xl font-bold sm:text-4xl">{formatMoney(balance)}</p>
            <p className="mt-1 text-xs text-white/50">Net des frais Paylinko · retrait instantané vers Mobile Money</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setWithdraw(true)} className="bg-accent-500 text-ink hover:bg-accent-400">
              <ArrowDownToLine className="h-4 w-4" /> Retirer
            </Button>
            <Link href="/dashboard/liens/creer">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Plus className="h-4 w-4" /> Lien de paiement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi label="Total des revenus" unit="XOF" value={formatNumber(revenue)} />
        <Kpi label="Transactions réussies" icon={<CreditCard className="h-4 w-4" />} value={formatNumber(successCount)} hint={`${conversion} % de conversion`} />
        <Kpi label="Transactions en attente" unit="XOF" value={formatNumber(pending)} />
        <Kpi
          label="Croissance"
          icon={growth >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)} %`}
          hint="vs période précédente"
          tone={growth >= 0 ? "up" : "down"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="min-w-0 p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold">
              Bilan <span className="font-normal text-slate-400">(XOF)</span>
            </p>
            <Select value={chartRange} onChange={(e) => setChartRange(e.target.value as "year" | "month")} className="h-9 !w-auto">
              <option value="year">Dernière année</option>
              <option value="month">30 derniers jours</option>
            </Select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -8, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef0f4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" interval={chartRange === "month" ? 4 : 0} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#64748b"
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))}
                />
                <Tooltip
                  cursor={{ fill: "#f3f1ff" }}
                  formatter={(v: number) => [formatMoney(v), "Revenus"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Bar dataKey="total" fill="#14121f" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Paiements récents</p>
            <Link href="/dashboard/transactions" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              Tout voir <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm font-medium text-slate-700">Aucune transaction réussie trouvée</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {COUNTRY_BY_CODE[t.country]?.flag}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.customerName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {t.source.label} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-semibold">+{formatNumber(t.amount)}</p>
                    <StatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <WithdrawModal open={withdraw} onClose={() => setWithdraw(false)} />
    </>
  );
}

function Kpi({ label, value, unit, icon, hint, tone }: { label: string; value: string; unit?: string; icon?: React.ReactNode; hint?: string; tone?: "up" | "down" }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-600 sm:text-sm">{label}</p>
        {unit ? <span className="text-xs font-semibold text-slate-700">{unit}</span> : icon}
      </div>
      <p className={clsx("tabular mt-3 font-display text-2xl font-bold sm:text-3xl", tone === "down" && "text-red-600")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
