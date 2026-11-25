"use client";

import { Gift, MessageCircle, Users } from "lucide-react";
import { Card, CopyButton, PageHeader } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { useStore } from "@/lib/store";

const COMMISSION = 0.2; // 20 % des frais générés par les filleuls

export default function AffiliationPage() {
  const profile = useStore((s) => s.profile);
  const referrals = useStore((s) => s.referrals);
  const origin = useOrigin();
  const url = `${origin}/inscription?ref=${profile.referralCode}`;
  const volume = referrals.reduce((s, r) => s + r.volume, 0);
  const earned = Math.round(volume * 0.025 * COMMISSION);

  return (
    <>
      <PageHeader title="Affiliation" subtitle="Invitez d'autres entrepreneurs et touchez 20 % des frais générés par leurs ventes, à vie." />

      <Card className="mb-5 overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white sm:flex-row sm:items-center">
          <Gift className="h-10 w-10 shrink-0 text-accent-400" />
          <div className="flex-1">
            <p className="text-sm text-white/70">Votre lien de parrainage</p>
            <p className="mt-0.5 break-all font-display text-lg font-bold">{url.replace(/^https?:\/\//, "")}</p>
          </div>
          <div className="flex gap-2">
            <CopyButton value={url} label="Copier" className="border-white/20 bg-white/10 text-white hover:bg-white/20" />
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Je reçois mes paiements Mobile Money avec Paylinko. Inscris-toi avec mon lien : ${url}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4" /> Partager
            </a>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          ["Filleuls", String(referrals.length)],
          ["Volume généré", formatMoney(volume)],
          ["Commissions", formatMoney(earned)],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="tabular mt-1 font-display text-lg font-bold sm:text-2xl">{v}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="border-b border-slate-100 px-4 py-3 font-semibold">Mes filleuls</p>
        {referrals.length === 0 ? (
          <div className="flex flex-col items-center p-10 text-center text-sm text-slate-500">
            <Users className="mb-2 h-6 w-6" /> Aucun filleul pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-slate-500">Inscrit le {formatDate(r.joinedAt, false)}</p>
                </div>
                <div className="text-right">
                  <p className="tabular font-semibold">{formatMoney(r.volume)}</p>
                  <p className="tabular text-xs text-emerald-600">+{formatMoney(Math.round(r.volume * 0.025 * COMMISSION))}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
