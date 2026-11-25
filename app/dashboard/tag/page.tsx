"use client";

import { AtSign, Check, MessageCircle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { Button, Card, CopyButton, Input, Label, PageHeader } from "@/components/ui";
import { formatDate, formatMoney, slugify } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function TagPage() {
  const profile = useStore((s) => s.profile);
  const update = useStore((s) => s.updateProfile);
  const txs = useStore((s) => s.transactions).filter((t) => t.source.type === "tag");
  const origin = useOrigin();
  const [tag, setTag] = useState(profile.tag);
  const [saved, setSaved] = useState(false);
  const url = `${origin}/t/${profile.tag}`;

  return (
    <>
      <PageHeader title="Tag" subtitle="Votre page de paiement personnelle : vos clients choisissent le montant et paient." />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const clean = slugify(tag);
              if (clean.length < 3) return;
              update({ tag: clean });
              setTag(clean);
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
          >
            <Label htmlFor="tag">Votre Paylinko Tag</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="tag" value={tag} onChange={(e) => setTag(slugify(e.target.value))} className="pl-9" maxLength={20} />
              </div>
              <Button type="submit" variant="dark" disabled={tag.length < 3 || tag === profile.tag}>
                {saved ? <Check className="h-4 w-4" /> : "Enregistrer"}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">3 à 20 caractères, lettres minuscules et chiffres.</p>
          </form>

          <div className="mt-6 rounded-2xl bg-brand-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Votre lien</p>
            <div className="mt-1 flex items-center gap-2">
              <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate font-display text-lg font-bold text-ink hover:underline">
                {url.replace(/^https?:\/\//, "")}
              </a>
              <CopyButton value={url} />
            </div>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Payez-moi facilement par Mobile Money : ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white"
          >
            <MessageCircle className="h-4 w-4" /> Partager sur WhatsApp
          </a>

          <h2 className="mt-8 font-semibold">Paiements reçus via le Tag</h2>
          {txs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Aucun paiement pour l&apos;instant.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {txs.map((t) => (
                <li key={t.id} className="flex justify-between py-2.5 text-sm">
                  <span>
                    {t.customerName} <span className="text-xs text-slate-400">· {formatDate(t.date)}</span>
                  </span>
                  <span className="tabular font-semibold">{formatMoney(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 text-center">
          <p className="font-semibold">QR code à afficher</p>
          <p className="text-sm text-slate-500">En caisse, sur votre stand ou votre vitrine.</p>
          <div className="mx-auto mt-4 inline-block rounded-3xl bg-ink p-5">
            <div className="rounded-2xl bg-white p-3">
              <QRCodeCanvas value={url} size={170} fgColor="#14121f" />
            </div>
            <p className="mt-3 font-display font-bold text-white">@{profile.tag}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
