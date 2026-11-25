"use client";

import { CheckCircle2, Clock, FileIcon, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NotFoundCard, PublicShell } from "@/components/PublicShell";
import { Button, Logo } from "@/components/ui";
import { COUNTRY_BY_CODE } from "@/lib/countries";
import { formatDate, formatMoney } from "@/lib/format";
import { useStore } from "@/lib/store";

const TIMEOUT = 5 * 60;
const DEMO_AUTO_CONFIRM = 12;

function retryHref(type: string, refId: string, tag: string) {
  if (type === "link") return `/pay/${refId}`;
  if (type === "invoice") return `/facture/${refId}`;
  if (type === "tag") return `/t/${tag}`;
  return "/";
}

function Waiting({ txId }: { txId: string }) {
  const tx = useStore((s) => s.transactions.find((t) => t.id === txId));
  const update = useStore((s) => s.updateTransaction);
  const links = useStore((s) => s.links);
  const tag = useStore((s) => s.profile.tag);
  const [left, setLeft] = useState(() => (tx ? Math.max(0, TIMEOUT - Math.floor((Date.now() - new Date(tx.date).getTime()) / 1000)) : 0));
  const [auto, setAuto] = useState(true);

  const pending = tx?.status === "pending";

  useEffect(() => {
    if (!pending) return;
    const i = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(i);
  }, [pending]);

  useEffect(() => {
    if (!pending || !tx) return;
    if (left === 0) update(tx.id, { status: "not_collected" });
    else if (auto && TIMEOUT - left >= DEMO_AUTO_CONFIRM) update(tx.id, { status: "success" });
  }, [left, pending, auto, tx, update]);

  if (!tx) return <NotFoundCard text="Transaction introuvable." />;

  const link = tx.source.type === "link" ? links.find((l) => l.id === tx.source.refId) : undefined;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const progress = left / TIMEOUT;
  const C = 2 * Math.PI * 92;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center px-4 py-10 text-center">
      <Logo />

      {pending && (
        <>
          <div className="relative mt-14 h-52 w-52">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r="92" fill="none" stroke="#eef0f4" strokeWidth="10" />
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="#14121f"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <span className="tabular absolute inset-0 flex items-center justify-center font-display text-5xl font-bold">
              {mm}:{ss}
            </span>
          </div>
          <p className="mt-8 font-semibold">En attente</p>
          <p className="mt-2 text-sm text-slate-600">
            Vous allez recevoir une requête de paiement de la part de votre opérateur <strong>{tx.operator}</strong> sur le{" "}
            <strong>{tx.customerPhone}</strong>. Veuillez compléter cette étape pour finaliser votre achat.
          </p>
          <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Montant</span>
              <span className="tabular font-semibold">{formatMoney(tx.localAmount, tx.currency)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-500">Pour</span>
              <span className="truncate pl-4 font-medium">{tx.source.label}</span>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" /> Composez le code USSD de votre opérateur si la notification n&apos;apparaît pas.
          </p>

          <div className="mt-10 w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-left text-sm">
            <p className="font-semibold text-amber-800">Mode démo</p>
            <p className="mt-0.5 text-amber-700">
              Aucun opérateur n&apos;est encore branché.{" "}
              {auto ? `Confirmation automatique dans ${Math.max(0, DEMO_AUTO_CONFIRM - (TIMEOUT - left))} s.` : "Choisissez la réponse de l'opérateur :"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => update(tx.id, { status: "success" })}>
                Simuler succès
              </Button>
              <Button size="sm" variant="secondary" onClick={() => update(tx.id, { status: "failed" })}>
                Simuler refus
              </Button>
              {auto && (
                <Button size="sm" variant="ghost" onClick={() => setAuto(false)}>
                  Désactiver l&apos;auto
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {tx.status === "success" && (
        <div className="animate-in mt-14 w-full">
          <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-500" strokeWidth={1.5} />
          <h1 className="mt-5 font-display text-2xl font-bold">Paiement réussi</h1>
          <p className="mt-2 text-sm text-slate-600">Merci {tx.customerName.split(" ")[0]} ! Un reçu a été envoyé à {tx.customerEmail || "votre adresse"}.</p>
          <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-left text-sm">
            {[
              ["Référence", tx.id.slice(0, 8).toUpperCase()],
              ["Produit", tx.source.label],
              ["Montant", formatMoney(tx.localAmount, tx.currency)],
              ["Moyen", `${COUNTRY_BY_CODE[tx.country]?.flag ?? ""} ${tx.operator}`],
              ["Date", formatDate(tx.date)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="tabular font-medium">{v}</span>
              </div>
            ))}
          </div>
          {link && link.files.length > 0 && (
            <div className="mt-4 rounded-2xl bg-brand-50 p-4 text-left text-sm">
              <p className="font-semibold text-brand-800">Vos fichiers</p>
              <ul className="mt-2 space-y-1.5">
                {link.files.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 text-brand-900">
                    <FileIcon className="h-4 w-4" /> {f.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-brand-700">Les liens de téléchargement ont été envoyés par email.</p>
            </div>
          )}
          {link?.redirectUrl && (
            <a href={link.redirectUrl}>
              <Button variant="dark" size="lg" className="mt-6 w-full rounded-full">
                Continuer
              </Button>
            </a>
          )}
          <Button variant="secondary" className="mt-3 w-full" onClick={() => window.print()}>
            Imprimer le reçu
          </Button>
        </div>
      )}

      {(tx.status === "failed" || tx.status === "not_collected") && (
        <div className="animate-in mt-14 w-full">
          <XCircle className="mx-auto h-20 w-20 text-red-500" strokeWidth={1.5} />
          <h1 className="mt-5 font-display text-2xl font-bold">{tx.status === "failed" ? "Paiement refusé" : "Délai expiré"}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {tx.status === "failed"
              ? "Votre opérateur a refusé la transaction (solde insuffisant ou code erroné). Aucun montant n'a été débité."
              : "La requête n'a pas été validée à temps. Aucun montant n'a été débité."}
          </p>
          <Link href={retryHref(tx.source.type, tx.source.refId, tag)}>
            <Button variant="dark" size="lg" className="mt-8 w-full rounded-full">
              <RotateCcw className="h-4 w-4" /> Réessayer
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PaymentStatusPage({ params }: { params: { txId: string } }) {
  return (
    <PublicShell>
      <Waiting txId={params.txId} />
    </PublicShell>
  );
}
