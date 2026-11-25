"use client";

import { useRouter } from "next/navigation";
import { Checkout } from "@/components/Checkout";
import { NotFoundCard, PublicShell } from "@/components/PublicShell";
import { formatDate, formatMoney } from "@/lib/format";
import { invoiceTotal } from "@/lib/invoice";
import { useStore } from "@/lib/store";

function InvoicePay({ id }: { id: string }) {
  const router = useRouter();
  const inv = useStore((s) => s.invoices.find((i) => i.id === id));
  const profile = useStore((s) => s.profile);
  const addTransaction = useStore((s) => s.addTransaction);
  if (!inv) return <NotFoundCard text="Facture introuvable." />;
  const total = invoiceTotal(inv);

  return (
    <Checkout
      title={`Facture ${inv.number}`}
      price={total}
      merchant={profile.businessName}
      feesPaidBy={profile.feesPaidBy}
      unavailable={inv.status === "paid" ? "Cette facture a déjà été réglée. Merci !" : inv.status === "draft" ? "Cette facture n'a pas encore été émise." : null}
      aside={
        <div className="mt-6 rounded-3xl border border-slate-200 p-5">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-slate-500">Facturé à</p>
              <p className="font-semibold">{inv.clientName}</p>
              {inv.clientEmail && <p className="text-slate-500">{inv.clientEmail}</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-500">Échéance</p>
              <p className="font-semibold">{formatDate(inv.dueDate, false)}</p>
            </div>
          </div>
          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Désignation</th>
                <th className="pb-2 text-right font-medium">Qté</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2.5">
                    {it.label}
                    <span className="block text-xs text-slate-400">{formatMoney(it.unitPrice)} / u</span>
                  </td>
                  <td className="tabular py-2.5 text-right">{it.qty}</td>
                  <td className="tabular py-2.5 text-right">{formatMoney(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-3 font-semibold">
                  Total
                </td>
                <td className="tabular pt-3 text-right font-display text-lg font-bold">{formatMoney(total)}</td>
              </tr>
            </tfoot>
          </table>
          {inv.note && <p className="mt-4 text-sm text-slate-600">{inv.note}</p>}
        </div>
      }
      onPay={(p) => {
        const tx = addTransaction({
          status: "pending",
          direction: "in",
          customerName: p.name,
          customerEmail: p.email,
          customerPhone: p.phone,
          country: p.country,
          operator: p.operator,
          amount: p.amount,
          localAmount: p.localAmount,
          currency: p.currency,
          fee: p.fee,
          source: { type: "invoice", refId: inv.id, label: `Facture ${inv.number}` },
        });
        router.push(`/paiement/${tx.id}`);
      }}
    />
  );
}

export default function InvoicePublicPage({ params }: { params: { id: string } }) {
  return (
    <PublicShell>
      <InvoicePay id={params.id} />
    </PublicShell>
  );
}
