"use client";

import { useState } from "react";
import { COUNTRIES, COUNTRY_BY_CODE, convertFromXOF } from "@/lib/countries";
import { formatNumber } from "@/lib/format";
import { Button, Input, Label, Modal, Select } from "./ui";

export function RateCalculator({ open, onClose, initial, onConfirm }: { open: boolean; onClose: () => void; initial: number; onConfirm?: (xof: number) => void }) {
  const [price, setPrice] = useState(initial ? String(initial) : "");
  const [code, setCode] = useState("");
  const country = code ? COUNTRY_BY_CODE[code] : null;
  const n = Number(price) || 0;

  return (
    <Modal open={open} onClose={onClose} title="Calculateur de taux" description="Le montant que vous recevez des pays couverts par Paylinko. Ces taux dépendent de votre pays actuel.">
      <div className="space-y-4">
        <div>
          <Label htmlFor="rc-price">Prix</Label>
          <Input id="rc-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} suffix="XOF" placeholder="0" />
          <p className="mt-1.5 text-xs text-brand-700">Le montant que je recevrai sur mon Mobile Money</p>
        </div>
        <div>
          <Label htmlFor="rc-country">Pays</Label>
          <Select id="rc-country" value={code} onChange={(e) => setCode(e.target.value)}>
            <option value="">Sélectionnez un pays</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Montant</Label>
          <Input readOnly value={country && n ? formatNumber(convertFromXOF(n, country)) : "--"} suffix={country?.currency ?? "XOF"} className="bg-slate-50" />
          <p className="mt-1.5 text-xs text-slate-500">Le montant que l&apos;acheteur paiera</p>
        </div>

        <details className="rounded-xl bg-slate-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">Voir tous les pays</summary>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {COUNTRIES.map((c) => (
              <li key={c.code} className="flex justify-between text-slate-600">
                <span>
                  {c.flag} {c.name}
                </span>
                <span className="tabular font-medium text-slate-800">
                  {n ? formatNumber(convertFromXOF(n, c)) : "—"} {c.currency}
                </span>
              </li>
            ))}
          </ul>
        </details>

        <div className="flex justify-end pt-1">
          <Button
            variant="dark"
            size="lg"
            className="rounded-full"
            onClick={() => {
              if (n) onConfirm?.(n);
              onClose();
            }}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
