"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COUNTRIES, COUNTRY_BY_CODE, computeFee, convertFromXOF } from "@/lib/countries";
import { formatNumber } from "@/lib/format";
import { Button, Input, Label, Logo, Select, Spinner } from "./ui";

export type CheckoutPayload = {
  name: string;
  email: string;
  country: string;
  phone: string;
  operator: string;
  amount: number;
  localAmount: number;
  currency: string;
  fee: number;
  address?: string;
};

type Props = {
  title: string;
  description?: string;
  images?: string[];
  /** Prix en XOF ; null = montant libre saisi par le client. */
  price: number | null;
  merchant: string;
  feesPaidBy?: "merchant" | "customer";
  collectAddress?: boolean;
  preview?: boolean;
  unavailable?: string | null;
  aside?: React.ReactNode;
  onPay?: (p: CheckoutPayload) => void;
};

export function Checkout({ title, description, images = [], price, merchant, feesPaidBy = "merchant", collectAddress, preview, unavailable, aside, onPay }: Props) {
  const [idx, setIdx] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState("");
  const [address, setAddress] = useState("");
  const [free, setFree] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Détection approximative du pays via la langue/fuseau du navigateur.
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const guess: Record<string, string> = {
      "Africa/Abidjan": "CI", "Africa/Dakar": "SN", "Africa/Douala": "CM", "Africa/Porto-Novo": "BJ", "Africa/Lome": "TG",
      "Africa/Ouagadougou": "BF", "Africa/Bamako": "ML", "Africa/Niamey": "NE", "Africa/Libreville": "GA", "Africa/Brazzaville": "CG",
      "Africa/Kinshasa": "CD", "Africa/Lubumbashi": "CD", "Africa/Nairobi": "KE", "Africa/Kigali": "RW", "Africa/Dar_es_Salaam": "TZ",
      "Africa/Kampala": "UG", "Africa/Conakry": "GN",
    };
    if (guess[tz]) setCountry(guess[tz]);
  }, []);

  const c = country ? COUNTRY_BY_CODE[country] : null;
  useEffect(() => setOperator(""), [country]);

  const base = price ?? (Number(free) || 0);
  const fee = computeFee(base);
  const total = feesPaidBy === "customer" ? base + fee : base;
  const local = useMemo(() => (c ? convertFromXOF(total, c) : total), [c, total]);
  const currency = c?.currency ?? "XOF";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preview || unavailable) return;
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Indiquez votre nom complet.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Adresse email invalide.";
    if (!c) errs.country = "Choisissez votre pays.";
    if (phone.replace(/\D/g, "").length < 7) errs.phone = "Numéro trop court.";
    if (!operator) errs.operator = "Choisissez votre opérateur.";
    if (price === null && base < 100) errs.free = "Montant minimum : 100 XOF.";
    if (collectAddress && address.trim().length < 5) errs.address = "Adresse de livraison requise.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      onPay?.({
        name: name.trim(),
        email: email.trim(),
        country,
        phone: `${c!.dial} ${phone.trim()}`,
        operator,
        amount: base,
        localAmount: local,
        currency,
        fee,
        address: address.trim() || undefined,
      });
    }, 700);
  };

  return (
    <div className={clsx("mx-auto w-full max-w-5xl", preview ? "px-0" : "px-4 py-8 sm:py-12")}>
      <div className="mb-6 flex items-center justify-between">
        <Logo />
        <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <Lock className="h-3.5 w-3.5" /> Paiement sécurisé
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {images.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[idx]} alt={title} className="aspect-[4/3] w-full object-cover" />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIdx((idx - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                    aria-label="Image précédente"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdx((idx + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                    aria-label="Image suivante"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-2.5 py-0.5 text-xs text-white">
                    {idx + 1} sur {images.length}
                  </span>
                </>
              )}
            </div>
          )}
          <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">{merchant}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">{title || "Nom du produit"}</h1>
          {price !== null && (
            <p className="tabular mt-2 font-display text-2xl font-semibold">
              {formatNumber(price)}
              <sup className="ml-0.5 text-xs font-medium">XOF</sup>
            </p>
          )}
          {description && <p className="mt-3 whitespace-pre-line text-slate-700">{description}</p>}
          {aside}
        </div>

        <form onSubmit={submit} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6" noValidate>
          <p className="font-display text-lg font-bold">Paiement</p>
          <p className="mb-5 text-sm text-slate-500">Pour procéder à l&apos;achat, veuillez compléter les informations demandées.</p>

          {unavailable ? (
            <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-600">{unavailable}</div>
          ) : (
            <div className="space-y-3.5">
              {price === null && (
                <Field error={errors.free}>
                  <Label htmlFor="co-free">Montant</Label>
                  <Input id="co-free" inputMode="numeric" value={free} onChange={(e) => setFree(e.target.value.replace(/\D/g, ""))} suffix="XOF" placeholder="Saisissez un montant" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[1000, 2500, 5000, 10000].map((v) => (
                      <button key={v} type="button" onClick={() => setFree(String(v))} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50">
                        {formatNumber(v)}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
              <Field error={errors.name}>
                <Label htmlFor="co-name">Nom et prénom</Label>
                <Input id="co-name" autoComplete="name" placeholder="Ex : Awa Diop" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field error={errors.email}>
                <Label htmlFor="co-email">Email</Label>
                <Input id="co-email" type="email" autoComplete="email" placeholder="awa@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field error={errors.country || errors.phone}>
                <Label htmlFor="co-phone">Numéro Mobile Money</Label>
                <div className="flex gap-2">
                  <div className="w-[116px] shrink-0">
                    <Select aria-label="Pays" value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="">--</option>
                      {COUNTRIES.map((x) => (
                        <option key={x.code} value={x.code}>
                          {x.flag} {x.dial}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Input id="co-phone" className="min-w-0" inputMode="tel" autoComplete="tel-national" placeholder={c?.phoneHint ?? "XXX XXX XXX"} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </Field>
              <Field error={errors.operator}>
                <Label htmlFor="co-op">Opérateur</Label>
                <Select id="co-op" value={operator} onChange={(e) => setOperator(e.target.value)} disabled={!c}>
                  <option value="">{c ? "Choisir opérateur" : "Choisissez d'abord un pays"}</option>
                  {c?.operators.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </Field>
              {collectAddress && (
                <Field error={errors.address}>
                  <Label htmlFor="co-addr">Adresse de livraison</Label>
                  <Input id="co-addr" autoComplete="street-address" placeholder="Quartier, ville" value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>
              )}

              <div className="rounded-2xl bg-slate-50 p-3.5 text-sm">
                {feesPaidBy === "customer" && base > 0 && (
                  <div className="mb-1 flex justify-between text-slate-500">
                    <span>Frais de service</span>
                    <span className="tabular">{formatNumber(fee)} XOF</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600">Total à payer</span>
                  <span className="tabular font-display text-xl font-bold text-ink">
                    {formatNumber(local)} {currency}
                  </span>
                </div>
                {c && c.currency !== "XOF" && base > 0 && <p className="mt-1 text-right text-xs text-slate-400">≈ {formatNumber(total)} XOF</p>}
              </div>

              <Button type="submit" variant="dark" size="lg" className="w-full rounded-full" disabled={preview || loading}>
                {loading ? <Spinner /> : "Payer"}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Vos données sont chiffrées et ne sont jamais partagées.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
