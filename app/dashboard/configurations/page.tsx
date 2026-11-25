"use client";

import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button, Card, Input, Label, Modal, PageHeader, Select, Toggle } from "@/components/ui";
import { COUNTRIES, COUNTRY_BY_CODE } from "@/lib/countries";
import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const profile = useStore((s) => s.profile);
  const update = useStore((s) => s.updateProfile);
  const resetDemo = useStore((s) => s.resetDemo);
  const [form, setForm] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => ({ ...f, [k]: v }));
  const country = COUNTRY_BY_CODE[form.country];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Configurations"
        subtitle="Gérez votre profil, vos versements et vos préférences."
        actions={
          <Button type="submit" variant="dark">
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Enregistré
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        }
      />

      <div className="space-y-5">
        <Section title="Mes informations" text="Affichées sur vos pages de paiement et reçus.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom">
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </Field>
            <Field label="Nom">
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </Field>
            <Field label="Nom de l'entreprise / boutique">
              <Input value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Téléphone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Pays">
              <Select
                value={form.country}
                onChange={(e) => {
                  const c = COUNTRY_BY_CODE[e.target.value];
                  setForm((f) => ({ ...f, country: c.code, payoutOperator: c.operators[0] }));
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Section>

        <Section title="Compte de versement" text="Où vous recevez vos retraits.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opérateur">
              <Select value={form.payoutOperator} onChange={(e) => set("payoutOperator", e.target.value)}>
                {country?.operators.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <Field label="Numéro Mobile Money">
              <div className="flex gap-2">
                <span className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm">{country?.dial}</span>
                <Input value={form.payoutNumber} onChange={(e) => set("payoutNumber", e.target.value)} />
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Frais de transaction" text="2,5 % par encaissement réussi. Aucun abonnement.">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["merchant", "Je paie les frais", "Le client paie le prix affiché."],
                ["customer", "Le client paie les frais", "Les frais s'ajoutent au total du client."],
              ] as const
            ).map(([v, t, d]) => (
              <label key={v} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${form.feesPaidBy === v ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
                <input type="radio" name="fees" checked={form.feesPaidBy === v} onChange={() => set("feesPaidBy", v)} className="mt-1 accent-brand-600" />
                <span>
                  <span className="block text-sm font-semibold">{t}</span>
                  <span className="text-xs text-slate-500">{d}</span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Notifications" text="Soyez prévenu à chaque paiement.">
          <div className="space-y-3">
            <Row label="Email à chaque paiement reçu">
              <Toggle checked={form.notifyEmail} onChange={(v) => set("notifyEmail", v)} label="Notifications email" />
            </Row>
            <Row label="SMS à chaque paiement reçu">
              <Toggle checked={form.notifySms} onChange={(v) => set("notifySms", v)} label="Notifications SMS" />
            </Row>
          </div>
        </Section>

        <Section title="Données de démonstration" text="Les données sont stockées dans ce navigateur.">
          <Button type="button" variant="secondary" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> Réinitialiser la démo
          </Button>
        </Section>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Réinitialiser la démo ?" description="Tous vos liens, transactions et factures seront remplacés par les données d'exemple.">
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={() => {
              resetDemo();
              setForm(useStore.getState().profile);
              setConfirmReset(false);
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </Modal>
    </form>
  );
}

function Section({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <Card className="grid gap-4 p-5 lg:grid-cols-[260px_1fr] lg:gap-8 lg:p-6">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
      <div>{children}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      {children}
    </div>
  );
}
