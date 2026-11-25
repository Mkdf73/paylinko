"use client";

import { Eye, Link2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Pill } from "@/components/StatusBadge";
import { Button, Card, CopyButton, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { formatDate, formatMoney, linkUnavailableReason } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function LinksPage() {
  const links = useStore((s) => s.links);
  const txs = useStore((s) => s.transactions);
  const origin = useOrigin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const stats = useMemo(() => {
    const m: Record<string, { sales: number; revenue: number }> = {};
    for (const t of txs) {
      if (t.source.type !== "link" || t.status !== "success") continue;
      m[t.source.refId] ??= { sales: 0, revenue: 0 };
      m[t.source.refId].sales++;
      m[t.source.refId].revenue += t.amount;
    }
    return m;
  }, [txs]);

  const list = links.filter((l) => {
    if (q && !l.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (status && l.status !== status) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Liens de paiement"
        subtitle="Partagez un lien, encaissez par Mobile Money dans toute l'Afrique."
        actions={
          <Link href="/dashboard/liens/creer">
            <Button variant="dark">
              <Plus className="h-4 w-4" /> Créer un lien
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher un lien..." value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 sm:w-44">
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Désactivés</option>
        </Select>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Link2 className="h-6 w-6" />}
            title="Aucun lien de paiement"
            text="Créez votre premier lien et partagez-le sur WhatsApp, Instagram ou par SMS."
            action={
              <Link href="/dashboard/liens/creer">
                <Button>Créer un lien</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((l) => {
            const s = stats[l.id] ?? { sales: 0, revenue: 0 };
            const reason = linkUnavailableReason(l);
            const url = `${origin}/pay/${l.id}`;
            return (
              <Card key={l.id} className="group flex flex-col overflow-hidden transition hover:shadow-lg">
                <Link href={`/dashboard/liens/${l.id}`} className="block">
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {l.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.images[0]} alt="" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-3 top-3">
                      {reason ? <Pill tone={l.status === "inactive" ? "slate" : "amber"}>{l.status === "inactive" ? "Inactif" : "Indisponible"}</Pill> : <Pill tone="green">Actif</Pill>}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="truncate font-semibold">{l.name}</p>
                    <p className="tabular mt-0.5 text-sm text-slate-600">{l.priceType === "free" ? "Montant libre" : formatMoney(l.price)}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {l.views}
                      </span>
                      <span>{s.sales} ventes</span>
                      <span className="tabular font-medium text-slate-700">{formatMoney(s.revenue)}</span>
                    </div>
                  </div>
                </Link>
                <div className="mt-auto flex items-center gap-2 border-t border-slate-100 px-4 py-3">
                  <code className="flex-1 truncate text-xs text-slate-500">{url.replace(/^https?:\/\//, "")}</code>
                  <CopyButton value={url} />
                </div>
                <p className="px-4 pb-3 text-[11px] text-slate-400">Créé le {formatDate(l.createdAt, false)}</p>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
