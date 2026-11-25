"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { COUNTRY_BY_CODE } from "@/lib/countries";
import { formatMoney } from "@/lib/format";
import { computeBalance, useStore } from "@/lib/store";
import { Button, Input, Label, Modal, Select, Spinner } from "./ui";

export function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useStore((s) => s.profile);
  const txs = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const balance = computeBalance(txs);
  const country = COUNTRY_BY_CODE[profile.country];

  const [amount, setAmount] = useState("");
  const [operator, setOperator] = useState(profile.payoutOperator || country?.operators[0] || "");
  const [phone, setPhone] = useState(profile.payoutNumber);
  const [step, setStep] = useState<"form" | "loading" | "done">("form");
  const [error, setError] = useState("");

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setAmount("");
      setError("");
    }, 200);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n < 500) return setError("Le montant minimum de retrait est de 500 XOF.");
    if (n > balance) return setError("Montant supérieur à votre solde disponible.");
    if (!phone.trim()) return setError("Indiquez le numéro qui recevra les fonds.");
    setError("");
    setStep("loading");
    setTimeout(() => {
      addTransaction({
        status: "success",
        direction: "out",
        customerName: `Retrait vers ${operator}`,
        customerEmail: "",
        customerPhone: `${country?.dial ?? ""} ${phone}`,
        country: profile.country,
        operator,
        amount: n,
        localAmount: n,
        currency: country?.currency ?? "XOF",
        fee: 0,
        source: { type: "withdrawal", refId: "", label: "Retrait" },
      });
      setStep("done");
    }, 1600);
  };

  return (
    <Modal open={open} onClose={close} title="Retirer mes fonds" description="Transférez votre solde vers votre Mobile Money, sans frais.">
      {step === "done" ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <p className="mt-4 font-display text-lg font-bold">Retrait envoyé</p>
          <p className="mt-1 text-sm text-slate-500">
            {formatMoney(Number(amount))} sont en route vers {operator} ({phone}).
          </p>
          <Button className="mt-6 w-full" onClick={close}>
            Terminer
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Solde disponible</p>
            <p className="tabular mt-1 font-display text-2xl font-bold text-ink">{formatMoney(balance)}</p>
          </div>
          <div>
            <Label htmlFor="w-amount">Montant</Label>
            <Input id="w-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} suffix="XOF" placeholder="0" />
            <button type="button" className="mt-1.5 text-xs font-medium text-brand-700 hover:underline" onClick={() => setAmount(String(Math.max(0, balance)))}>
              Tout retirer
            </button>
          </div>
          <div>
            <Label htmlFor="w-op">Opérateur</Label>
            <Select id="w-op" value={operator} onChange={(e) => setOperator(e.target.value)}>
              {country?.operators.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="w-phone">Numéro bénéficiaire</Label>
            <div className="flex gap-2">
              <span className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm">
                {country?.flag} {country?.dial}
              </span>
              <Input id="w-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="dark" size="lg" className="w-full" disabled={step === "loading"}>
            {step === "loading" ? <Spinner /> : "Confirmer le retrait"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
