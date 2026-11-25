"use client";

import clsx from "clsx";
import { ChevronDown, FileIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { computeFee } from "@/lib/countries";
import { formatMoney, resizeImage } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { LinkFile, PaymentLink } from "@/lib/types";
import { Checkout } from "./Checkout";
import { Dropzone } from "./Dropzone";
import { RateCalculator } from "./RateCalculator";
import { Button, Input, Label, Spinner, Textarea, Toggle } from "./ui";

const MAX_IMAGES = 8;
const MAX_SIZE = 5 * 1024 * 1024;

export function LinkForm({ initial }: { initial?: PaymentLink }) {
  const router = useRouter();
  const addLink = useStore((s) => s.addLink);
  const updateLink = useStore((s) => s.updateLink);
  const profile = useStore((s) => s.profile);

  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [name, setName] = useState(initial?.name ?? "");
  const [priceType, setPriceType] = useState<PaymentLink["priceType"]>(initial?.priceType ?? "fixed");
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [files, setFiles] = useState<LinkFile[]>(initial?.files ?? []);
  const [stock, setStock] = useState(initial?.stock != null ? String(initial.stock) : "");
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt?.slice(0, 10) ?? "");
  const [redirectUrl, setRedirectUrl] = useState(initial?.redirectUrl ?? "");
  const [collectAddress, setCollectAddress] = useState(initial?.collectAddress ?? false);
  const [advanced, setAdvanced] = useState(!!(initial?.stock != null || initial?.expiresAt || initial?.redirectUrl || initial?.collectAddress));
  const [calc, setCalc] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addImages = async (list: File[]) => {
    const valid = list.filter((f) => f.type.startsWith("image/") && f.size <= MAX_SIZE).slice(0, MAX_IMAGES - images.length);
    if (valid.length < list.length) setErrors((e) => ({ ...e, images: "Certaines images ont été ignorées (format ou taille > 5 Mo, ou limite de 8)." }));
    setBusy(true);
    const urls = await Promise.all(valid.map((f) => resizeImage(f)));
    setImages((prev) => [...prev, ...urls]);
    setBusy(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Donnez un nom à votre produit.";
    if (priceType === "fixed" && (Number(price) || 0) < 100) errs.price = "Prix minimum : 100 XOF.";
    if (redirectUrl && !/^https?:\/\//.test(redirectUrl)) errs.redirectUrl = "L'URL doit commencer par http:// ou https://";
    setErrors(errs);
    if (Object.keys(errs).length) {
      setTab("edit");
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim(),
      priceType,
      price: priceType === "fixed" ? Number(price) : 0,
      images,
      files,
      status: initial?.status ?? ("active" as const),
      stock: stock ? Number(stock) : null,
      expiresAt: expiresAt ? new Date(expiresAt + "T23:59:59").toISOString() : null,
      redirectUrl: redirectUrl.trim(),
      collectAddress,
    };
    if (initial) {
      updateLink(initial.id, data);
      router.push(`/dashboard/liens/${initial.id}`);
    } else {
      const link = addLink(data);
      router.push(`/dashboard/liens/${link.id}?nouveau=1`);
    }
  };

  const n = Number(price) || 0;

  return (
    <form onSubmit={submit}>
      <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={clsx("rounded-lg px-4 py-1.5 text-sm font-medium transition", tab === t ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-slate-800")}
          >
            {t === "edit" ? "Éditer" : "Aperçu"}
          </button>
        ))}
      </div>

      {tab === "preview" ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-8">
          <Checkout
            preview
            title={name}
            description={description}
            images={images}
            price={priceType === "fixed" ? n : null}
            merchant={profile.businessName}
            feesPaidBy={profile.feesPaidBy}
            collectAddress={collectAddress}
          />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <section>
            <Label>Images</Label>
            <Dropzone onFiles={addImages} accept="image/*" hint={`Ou cliquez pour parcourir (max ${MAX_IMAGES} fichiers, jusqu'à 5 Mo chacun)`} />
            {busy && <Spinner className="mt-3 text-brand-600" />}
            {errors.images && <p className="mt-2 text-xs text-amber-700">{errors.images}</p>}
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <div key={i} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-24 w-24 rounded-xl object-cover ring-1 ring-slate-200" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow"
                      aria-label="Retirer l'image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px] font-semibold">Couverture</span>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <Label htmlFor="lf-name">Nom produit</Label>
            <Input id="lf-name" placeholder="Entrez le nom du produit" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </section>

          <section>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="lf-price">Prix</Label>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                {(["fixed", "free"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPriceType(t)}
                    className={clsx("rounded-md px-2.5 py-1 font-medium", priceType === t ? "bg-white shadow-sm" : "text-slate-500")}
                  >
                    {t === "fixed" ? "Prix fixe" : "Montant libre"}
                  </button>
                ))}
              </div>
            </div>
            {priceType === "fixed" ? (
              <>
                <Input id="lf-price" inputMode="numeric" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} suffix="XOF" />
                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                <p className="mt-1.5 text-xs text-slate-500">
                  Utiliser cet{" "}
                  <button type="button" onClick={() => setCalc(true)} className="font-medium text-brand-700 underline">
                    outil
                  </button>{" "}
                  pour le calcul des taux par pays.
                  {n > 0 && (
                    <span className="ml-1">
                      Vous recevrez <strong>{formatMoney(profile.feesPaidBy === "customer" ? n : n - computeFee(n))}</strong> net.
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Le client choisit le montant au moment du paiement — idéal pour les dons, pourboires et cotisations.</p>
            )}
          </section>

          <section>
            <Label htmlFor="lf-desc">Description</Label>
            <Textarea id="lf-desc" placeholder="Décrivez votre produit en quelques mots." value={description} onChange={(e) => setDescription(e.target.value)} />
          </section>

          <section>
            <Label hint="(optionnel)">Fichiers</Label>
            <p className="-mt-1 mb-2 text-xs text-slate-500">Déposez les fichiers que vous souhaitez partager à votre client après un achat.</p>
            <Dropzone onFiles={(l) => setFiles((p) => [...p, ...l.map((f) => ({ name: f.name, size: f.size }))])} hint="PDF, ZIP, MP3, MP4… (jusqu'à 50 Mo)" />
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <FileIcon className="h-4 w-4 text-slate-500" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-slate-400">{(f.size / 1024 / 1024).toFixed(1)} Mo</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Retirer le fichier">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200">
            <button type="button" onClick={() => setAdvanced((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold">
              Options avancées
              <ChevronDown className={clsx("h-4 w-4 transition", advanced && "rotate-180")} />
            </button>
            {advanced && (
              <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="lf-stock" hint="(vide = illimité)">
                    Stock disponible
                  </Label>
                  <Input id="lf-stock" inputMode="numeric" placeholder="Illimité" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} />
                </div>
                <div>
                  <Label htmlFor="lf-exp" hint="(optionnel)">
                    Date d&apos;expiration
                  </Label>
                  <Input id="lf-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="lf-redirect" hint="(optionnel)">
                    Redirection après paiement
                  </Label>
                  <Input id="lf-redirect" placeholder="https://monsite.com/merci" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} />
                  {errors.redirectUrl && <p className="mt-1 text-xs text-red-600">{errors.redirectUrl}</p>}
                </div>
                <div className="flex items-center justify-between gap-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-medium">Demander l&apos;adresse de livraison</p>
                    <p className="text-xs text-slate-500">Pour les produits physiques.</p>
                  </div>
                  <Toggle checked={collectAddress} onChange={setCollectAddress} label="Demander l'adresse" />
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 mt-8 flex gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" variant="dark" className="flex-1 sm:flex-none">
          {initial ? "Enregistrer" : "Créer le lien"}
        </Button>
      </div>

      <RateCalculator key={String(calc)} open={calc} onClose={() => setCalc(false)} initial={n} onConfirm={(v) => setPrice(String(v))} />
    </form>
  );
}
