"use client";

import clsx from "clsx";
import { BadgeCheck, Globe2, Info, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { Button, Card, CopyButton, Input, Label, Logo, Modal, PageHeader, Select } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { useStore } from "@/lib/store";

// Coordonnées de démonstration (formats valides, aucun compte réel).
function demoAccounts(ref: string) {
  return {
    eur: { iban: "BE00 0000 0000 0000", bic: "DEMOBEB1XXX", address: "Adresse de la banque partenaire (UE)" },
    usd: { account: "000000000000", routing: "000000000", address: "Adresse de la banque partenaire (US)" },
    ref,
  };
}

export default function BankAccountPage() {
  const profile = useStore((s) => s.profile);
  const bankRef = useStore((s) => s.bankRef);
  const txs = useStore((s) => s.transactions).filter((t) => t.source.type === "bank");
  const addTransaction = useStore((s) => s.addTransaction);
  const [activated, setActivated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("paylinko-kyc") === "1";
    } catch {
      return false;
    }
  });
  const [kyc, setKyc] = useState(false);
  const [sim, setSim] = useState(false);
  const acc = demoAccounts(bankRef);
  const holder = `${profile.firstName} ${profile.lastName}`.toUpperCase();

  const activate = () => {
    try {
      localStorage.setItem("paylinko-kyc", "1");
    } catch {
      /* ignore */
    }
    setActivated(true);
    setKyc(false);
  };

  return (
    <>
      <PageHeader title="Compte bancaire" subtitle="Recevez des paiements de l'étranger directement dans votre portefeuille électronique." />

      {!activated ? (
        <Card className="mb-6 flex flex-col items-start gap-4 bg-gradient-to-br from-brand-50 to-white p-6 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Globe2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Activez vos comptes EUR et USD</p>
            <p className="text-sm text-slate-600">Vérifiez votre identité (2 minutes) pour obtenir un IBAN européen et un compte américain à votre nom.</p>
          </div>
          <Button onClick={() => setKyc(true)}>
            <ShieldCheck className="h-4 w-4" /> Vérifier mon identité
          </Button>
        </Card>
      ) : null}

      <div className={clsx("grid gap-5 lg:grid-cols-2", !activated && "pointer-events-none select-none opacity-60 blur-[2px]")}>
        <BankCard
          tone="green"
          currency="EUR"
          rows={[
            ["Titulaire", holder],
            ["Email", profile.email],
            ["IBAN", acc.eur.iban],
            ["BIC", acc.eur.bic],
            ["Code de référence", acc.ref],
            ["Adresse", acc.eur.address],
          ]}
        />
        <BankCard
          tone="accent"
          currency="USD"
          rows={[
            ["Titulaire", holder],
            ["Email", profile.email],
            ["Numéro de compte", acc.usd.account],
            ["Numéro de routage", acc.usd.routing],
            ["Code de référence", acc.ref],
            ["Adresse", acc.usd.address],
          ]}
        />
      </div>

      <p className="mt-5 flex items-start gap-2 text-sm text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Afin que Paylinko puisse suivre vos paiements, demandez à vos clients d&apos;ajouter votre code de référence unique <strong className="text-slate-800">{acc.ref}</strong> lors des virements.
      </p>
      <p className="mt-2 text-xs text-amber-700">Démo : les coordonnées ci-dessus sont fictives. Elles seront fournies par la banque partenaire une fois l&apos;intégration en place.</p>

      <div className="mt-10 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Virements reçus</h2>
          <p className="text-sm text-slate-500">Convertis automatiquement en XOF au taux du jour.</p>
        </div>
        {activated && (
          <Button variant="secondary" size="sm" onClick={() => setSim(true)}>
            Simuler un virement
          </Button>
        )}
      </div>
      <Card className="mt-3">
        {txs.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Aucun virement reçu pour le moment.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {txs.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{t.customerName}</p>
                  <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                </div>
                <div className="text-right">
                  <p className="tabular font-semibold">+{formatMoney(t.amount)}</p>
                  <p className="tabular text-xs text-slate-500">{formatMoney(t.localAmount, t.currency)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <KycModal open={kyc} onClose={() => setKyc(false)} onDone={activate} />
      <SimulateTransfer
        open={sim}
        onClose={() => setSim(false)}
        onSubmit={(name, amount, cur) => {
          const rate = cur === "EUR" ? 655.957 : 600;
          const xof = Math.round(amount * rate);
          addTransaction({
            status: "success",
            direction: "in",
            customerName: name,
            customerEmail: "",
            customerPhone: "—",
            country: profile.country,
            operator: `Virement ${cur}`,
            amount: xof,
            localAmount: amount,
            currency: cur,
            fee: Math.round(xof * 0.01),
            source: { type: "bank", refId: acc.ref, label: `Virement ${cur}` },
          });
          setSim(false);
        }}
      />
    </>
  );
}

function BankCard({ tone, currency, rows }: { tone: "green" | "accent"; currency: string; rows: [string, string][] }) {
  return (
    <div className={clsx("rounded-3xl p-6 shadow-sm", tone === "green" ? "bg-emerald-50 ring-1 ring-emerald-100" : "bg-ink text-white")}>
      <div className="mb-5 flex items-center justify-between">
        <Logo light={tone !== "green"} />
        <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-bold", tone === "green" ? "bg-emerald-100 text-emerald-800" : "bg-accent-500 text-ink")}>{currency}</span>
      </div>
      <dl className="space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <dt className={tone === "green" ? "text-emerald-800/80" : "text-white/60"}>{k}</dt>
            <dd className="flex min-w-0 items-center gap-1.5 text-right font-medium">
              <span className="truncate">{v}</span>
              {["IBAN", "BIC", "Numéro de compte", "Numéro de routage", "Code de référence"].includes(k) && (
                <CopyButton value={v.replace(/\s/g, "")} className={clsx("h-7 border-0 bg-transparent px-1", tone === "green" ? "text-emerald-800 hover:bg-emerald-100" : "text-white hover:bg-white/10")} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function KycModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  return (
    <Modal open={open} onClose={onClose} title="Vérification d'identité" description={`Étape ${step + 1} sur 2`}>
      {step === 0 ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(1);
          }}
        >
          <div>
            <Label>Type de pièce</Label>
            <Select required>
              <option>Carte nationale d&apos;identité</option>
              <option>Passeport</option>
              <option>Permis de conduire</option>
            </Select>
          </div>
          <div>
            <Label>Numéro de la pièce</Label>
            <Input required placeholder="Ex : 123456789" />
          </div>
          <div>
            <Label>Date de naissance</Label>
            <Input required type="date" />
          </div>
          <Button type="submit" variant="dark" className="w-full">
            Continuer
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:bg-slate-50">
            <Upload className="h-6 w-6 text-slate-500" />
            <span className="mt-2 text-sm font-medium">Photo recto/verso de la pièce</span>
            <span className="text-xs text-slate-500">JPG ou PNG</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:bg-slate-50">
            <Upload className="h-6 w-6 text-slate-500" />
            <span className="mt-2 text-sm font-medium">Selfie avec la pièce</span>
            <input type="file" accept="image/*" capture="user" className="hidden" />
          </label>
          <Button
            variant="dark"
            className="w-full"
            onClick={() => {
              onDone();
              setStep(0);
            }}
          >
            <BadgeCheck className="h-4 w-4" /> Soumettre
          </Button>
        </div>
      )}
    </Modal>
  );
}

function SimulateTransfer({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, amount: number, cur: string) => void }) {
  const [name, setName] = useState("Client Europe SAS");
  const [amount, setAmount] = useState("250");
  const [cur, setCur] = useState("EUR");
  return (
    <Modal open={open} onClose={onClose} title="Simuler un virement entrant">
      <div className="space-y-4">
        <div>
          <Label>Émetteur</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-[1fr_110px] gap-2">
          <div>
            <Label>Montant</Label>
            <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </div>
          <div>
            <Label>Devise</Label>
            <Select value={cur} onChange={(e) => setCur(e.target.value)}>
              <option>EUR</option>
              <option>USD</option>
            </Select>
          </div>
        </div>
        <Button variant="dark" className="w-full" onClick={() => Number(amount) > 0 && onSubmit(name || "Émetteur", Number(amount), cur)}>
          Recevoir le virement
        </Button>
      </div>
    </Modal>
  );
}
