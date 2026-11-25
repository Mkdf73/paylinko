"use client";

import { Download, ExternalLink, MessageCircle, MoreHorizontal, Pencil, Power, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { Pill, StatusBadge } from "@/components/StatusBadge";
import { Button, Card, CopyButton, Modal } from "@/components/ui";
import { formatDate, formatMoney, linkUnavailableReason } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function LinkDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const search = useSearchParams();
  const origin = useOrigin();
  const link = useStore((s) => s.links.find((l) => l.id === params.id));
  const allTxs = useStore((s) => s.transactions);
  const updateLink = useStore((s) => s.updateLink);
  const deleteLink = useStore((s) => s.deleteLink);
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!link) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Ce lien n&apos;existe pas ou a été supprimé.</p>
        <Link href="/dashboard/liens" className="mt-4 inline-block text-sm font-medium text-brand-700 underline">
          Retour aux liens
        </Link>
      </div>
    );
  }

  const url = `${origin}/pay/${link.id}`;
  const txs = allTxs.filter((t) => t.source.type === "link" && t.source.refId === link.id);
  const success = txs.filter((t) => t.status === "success");
  const revenue = success.reduce((s, t) => s + t.amount, 0);
  const conversion = link.views ? Math.min(100, Math.round((success.length / link.views) * 100)) : 0;
  const reason = linkUnavailableReason(link);
  const shareText = `${link.name} — payez en toute sécurité via Mobile Money : ${url}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `paylinko-qr-${link.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const rows: [string, React.ReactNode][] = [
    ["Statut", reason ? <Pill tone={link.status === "inactive" ? "slate" : "amber"}>{link.status === "inactive" ? "Inactif" : "Indisponible"}</Pill> : <Pill tone="green">Actif</Pill>],
    ["Montant du produit", link.priceType === "free" ? "Montant libre" : formatMoney(link.price)],
    ["Description", link.description || "—"],
    ["Stock", link.stock === null ? "Illimité" : `${link.stock} restant(s)`],
    ["Expiration", link.expiresAt ? formatDate(link.expiresAt, false) : "Jamais"],
    ...(link.redirectUrl ? ([["Redirection", link.redirectUrl]] as [string, string][]) : []),
    ["Date de création", formatDate(link.createdAt)],
    ["Mis à jour le", formatDate(link.updatedAt)],
  ];

  return (
    <>
      {search.get("nouveau") && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          🎉 Votre lien est prêt ! Copiez-le ou partagez-le directement sur WhatsApp.
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lien de paiement</h1>
        <p className="mt-1 text-sm text-slate-700">Copiez et partagez ce lien pour commencer à recevoir des paiements.</p>
        <p className="mt-3 font-medium">{link.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a href={url} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 sm:max-w-sm">
            {url.replace(/^https?:\/\//, "")}
          </a>
          <CopyButton value={url} />
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="Plus d'actions">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="animate-in absolute left-0 z-20 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl sm:left-auto sm:right-0">
                  <MenuItem icon={<ExternalLink className="h-4 w-4" />} onClick={() => window.open(url, "_blank")}>
                    Ouvrir la page
                  </MenuItem>
                  <MenuItem icon={<Pencil className="h-4 w-4" />} onClick={() => router.push(`/dashboard/liens/${link.id}/modifier`)}>
                    Modifier
                  </MenuItem>
                  <MenuItem
                    icon={<Power className="h-4 w-4" />}
                    onClick={() => {
                      updateLink(link.id, { status: link.status === "active" ? "inactive" : "active" });
                      setMenu(false);
                    }}
                  >
                    {link.status === "active" ? "Désactiver" : "Activer"}
                  </MenuItem>
                  <MenuItem
                    danger
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => {
                      setMenu(false);
                      setConfirmDelete(true);
                    }}
                  >
                    Supprimer
                  </MenuItem>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Vues", String(link.views)],
          ["Ventes", String(success.length)],
          ["Revenus", formatMoney(revenue)],
          ["Conversion", `${conversion} %`],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="tabular mt-1 font-display text-xl font-bold">{v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="font-semibold">Général</h2>
          <p className="mb-2 text-sm text-slate-500">Détail du lien de paiement.</p>
          <dl className="divide-y divide-slate-100 border-t border-slate-100">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-4 text-sm sm:grid-cols-[240px_1fr]">
                <dt className="font-medium text-slate-700">{k}</dt>
                <dd className="break-words text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>

          {link.images.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold">Images</h2>
              <p className="mb-3 text-sm text-slate-500">Photos du produit associées au lien de paiement.</p>
              <div className="flex flex-wrap gap-3">
                {link.images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="h-28 w-40 rounded-xl object-cover ring-1 ring-slate-200" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-semibold">Paiements reçus</h2>
            <p className="mb-3 text-sm text-slate-500">Les dernières transactions de ce lien.</p>
            {txs.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Aucun paiement pour l&apos;instant.</p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {txs.slice(0, 8).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.customerName}</p>
                      <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-semibold">{formatMoney(t.amount)}</p>
                      <StatusBadge status={t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5 text-center">
            <p className="mb-3 text-sm font-semibold">QR code du lien</p>
            <div ref={qrRef} className="inline-block rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <QRCodeCanvas value={url} size={180} fgColor="#14121f" level="M" />
            </div>
            <p className="mt-2 text-xs text-slate-500">À imprimer en boutique ou sur vos flyers.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={downloadQR}>
              <Download className="h-4 w-4" /> Télécharger
            </Button>
          </Card>
          <Card className="space-y-2 p-5">
            <p className="text-sm font-semibold">Partager</p>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-medium text-white hover:opacity-90">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={`sms:?&body=${encodeURIComponent(shareText)}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50">
              <Share2 className="h-4 w-4" /> SMS
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50">
              <Share2 className="h-4 w-4" /> Facebook
            </a>
          </Card>
        </aside>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Supprimer ce lien ?" description="Le lien ne pourra plus recevoir de paiements. Les transactions passées sont conservées.">
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              deleteLink(link.id);
              router.push("/dashboard/liens");
            }}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </>
  );
}

function MenuItem({ children, icon, onClick, danger }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 ${danger ? "text-red-600" : "text-slate-700"}`}>
      {icon}
      {children}
    </button>
  );
}
