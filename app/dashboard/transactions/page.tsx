"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, MoreHorizontal, PlusCircle, Receipt, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { STATUS_LABELS, StatusBadge } from "@/components/StatusBadge";
import { Button, Card, CopyButton, EmptyState, Input, Label, Modal, PageHeader, Select } from "@/components/ui";
import { COUNTRIES, COUNTRY_BY_CODE } from "@/lib/countries";
import { downloadCSV, formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Transaction, TxStatus } from "@/lib/types";

const STATUSES: TxStatus[] = ["success", "pending", "not_collected", "failed"];
const SOURCE_LABELS: Record<string, string> = { link: "Lien", invoice: "Facture", tag: "Tag", bank: "Virement", withdrawal: "Retrait" };

export default function TransactionsPage() {
  const txs = useStore((s) => s.transactions);
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState<TxStatus[]>([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return txs.filter((t) => {
      if (needle && ![t.id, t.customerName, t.customerPhone, t.customerEmail, t.source.label].some((v) => v.toLowerCase().includes(needle))) return false;
      if (statuses.length && !statuses.includes(t.status)) return false;
      if (country && t.country !== country) return false;
      if (source && t.source.type !== source) return false;
      if (from && t.date < from) return false;
      if (to && t.date.slice(0, 10) > to) return false;
      return true;
    });
  }, [txs, q, statuses, country, source, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * perPage, current * perPage);
  const activeFilters = [country, source, from, to].filter(Boolean).length;

  const exportCSV = () =>
    downloadCSV(`paylinko-transactions-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["ID", "Statut", "Date", "Type", "Source", "Client", "Email", "Téléphone", "Pays", "Opérateur", "Montant XOF", "Frais XOF", "Montant payé", "Devise"],
      ...filtered.map((t) => [
        t.id,
        STATUS_LABELS[t.status],
        formatDate(t.date),
        t.direction === "in" ? "Encaissement" : "Retrait",
        t.source.label,
        t.customerName,
        t.customerEmail,
        t.customerPhone,
        COUNTRY_BY_CODE[t.country]?.name ?? t.country,
        t.operator,
        t.amount,
        t.fee,
        t.localAmount,
        t.currency,
      ]),
    ]);

  const toggleStatus = (s: TxStatus) => {
    setPage(1);
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  return (
    <>
      <PageHeader title="Transactions" subtitle="Trackez, filtrez et exportez les données qui comptent pour votre business." />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filtrer transactions..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="h-10 pl-9"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <PlusCircle className="h-4 w-4" /> Statut
              {statuses.length > 0 && <span className="rounded-md bg-slate-100 px-1.5 text-xs">{statuses.length}</span>}
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="animate-in absolute left-0 z-20 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {STATUSES.map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50">
                      <input type="checkbox" checked={statuses.includes(s)} onChange={() => toggleStatus(s)} className="h-4 w-4 accent-brand-600" />
                      <StatusBadge status={s} />
                      <span className="ml-auto text-xs text-slate-400">{txs.filter((t) => t.status === s).length}</span>
                    </label>
                  ))}
                  {statuses.length > 0 && (
                    <button onClick={() => setStatuses([])} className="mt-1 w-full rounded-lg py-1.5 text-center text-xs text-slate-500 hover:bg-slate-50">
                      Effacer
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filtres
            {activeFilters > 0 && <span className="rounded-md bg-brand-600 px-1.5 text-xs text-white">{activeFilters}</span>}
          </Button>
          <Button variant="secondary" onClick={exportCSV} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Télécharger
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Receipt className="h-6 w-6" />} title="Aucune transaction" text="Aucune transaction ne correspond à vos critères." />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    {["ID", "Statut", "Date", "Nom client", "Numéro client", "Montant", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50" onClick={() => setSelected(t)}>
                      <td className="px-4 py-3.5 font-mono text-[13px] text-slate-700">{t.id.slice(0, 8)}…</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{formatDate(t.date)}</td>
                      <td className="px-4 py-3.5">{t.customerName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{t.customerPhone}</td>
                      <td className={clsx("tabular whitespace-nowrap px-4 py-3.5 font-medium", t.direction === "out" && "text-red-600")}>
                        {t.direction === "out" ? "−" : ""}
                        {formatMoney(t.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <MoreHorizontal className="ml-auto h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((t) => (
                <li key={t.id}>
                  <button className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left" onClick={() => setSelected(t)}>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.customerName}</p>
                      <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={clsx("tabular text-sm font-semibold", t.direction === "out" && "text-red-600")}>
                        {t.direction === "out" ? "−" : ""}
                        {formatMoney(t.amount)}
                      </p>
                      <StatusBadge status={t.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Lignes par page</span>
          <Select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 w-20"
          >
            {[10, 20, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </Select>
          <span className="text-slate-400">· {filtered.length} résultats</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-2 font-medium">
            Page {current} / {pages}
          </span>
          <PagerBtn onClick={() => setPage(1)} disabled={current === 1} label="Première page">
            <ChevronsLeft className="h-4 w-4" />
          </PagerBtn>
          <PagerBtn onClick={() => setPage(current - 1)} disabled={current === 1} label="Page précédente">
            <ChevronLeft className="h-4 w-4" />
          </PagerBtn>
          <PagerBtn onClick={() => setPage(current + 1)} disabled={current === pages} label="Page suivante">
            <ChevronRight className="h-4 w-4" />
          </PagerBtn>
          <PagerBtn onClick={() => setPage(pages)} disabled={current === pages} label="Dernière page">
            <ChevronsRight className="h-4 w-4" />
          </PagerBtn>
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtres" description="Affinez la liste des transactions.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Du</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>Au</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Pays du client</Label>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Tous les pays</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Source</Label>
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">Toutes</option>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setCountry("");
                setSource("");
                setFrom("");
                setTo("");
              }}
            >
              Réinitialiser
            </Button>
            <Button
              variant="dark"
              className="flex-1"
              onClick={() => {
                setPage(1);
                setFiltersOpen(false);
              }}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Détail de la transaction">
        {selected && <TxDetail t={selected} />}
      </Modal>
    </>
  );
}

function PagerBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function TxDetail({ t }: { t: Transaction }) {
  const c = COUNTRY_BY_CODE[t.country];
  const rows: [string, React.ReactNode][] = [
    ["Statut", <StatusBadge key="s" status={t.status} />],
    ["Date", formatDate(t.date)],
    ["Type", t.direction === "in" ? `Encaissement · ${SOURCE_LABELS[t.source.type]}` : "Retrait"],
    ["Source", t.source.label],
    ["Client", t.customerName],
    ...(t.customerEmail ? ([["Email", t.customerEmail]] as [string, string][]) : []),
    ["Téléphone", t.customerPhone],
    ["Pays · Opérateur", `${c?.flag ?? ""} ${c?.name ?? t.country} · ${t.operator}`],
    ["Montant payé", formatMoney(t.localAmount, t.currency)],
    ["Frais Paylinko", formatMoney(t.fee)],
    ["Net reçu", <strong key="n">{formatMoney(t.direction === "in" ? t.amount - t.fee : -t.amount)}</strong>],
  ];
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
        <code className="flex-1 truncate text-xs text-slate-600">{t.id}</code>
        <CopyButton value={t.id} />
      </div>
      <dl className="divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <dt className="text-slate-500">{k}</dt>
            <dd className="tabular text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-slate-400">Montant en XOF : {formatNumber(t.amount)}</p>
    </div>
  );
}
