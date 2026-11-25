"use client";

import { FileText, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Pill } from "@/components/StatusBadge";
import { Button, Card, CopyButton, EmptyState, Input, Label, Modal, PageHeader, Textarea } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { INVOICE_STATUS, invoiceStatus, invoiceTotal } from "@/lib/invoice";
import { useStore } from "@/lib/store";
import type { InvoiceItem } from "@/lib/types";

export default function InvoicesPage() {
  const invoices = useStore((s) => s.invoices);
  const updateInvoice = useStore((s) => s.updateInvoice);
  const deleteInvoice = useStore((s) => s.deleteInvoice);
  const origin = useOrigin();
  const [open, setOpen] = useState(false);

  const totals = invoices.reduce(
    (acc, i) => {
      const st = invoiceStatus(i);
      const t = invoiceTotal(i);
      if (st === "paid") acc.paid += t;
      else if (st !== "draft") acc.due += t;
      if (st === "overdue") acc.overdue += t;
      return acc;
    },
    { paid: 0, due: 0, overdue: 0 }
  );

  return (
    <>
      <PageHeader
        title="Factures"
        subtitle="Envoyez des factures payables par Mobile Money en un clic."
        actions={
          <Button variant="dark" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle facture
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          ["Encaissé", totals.paid, ""],
          ["À recevoir", totals.due, ""],
          ["En retard", totals.overdue, "text-red-600"],
        ].map(([k, v, cls]) => (
          <Card key={k as string} className="p-4">
            <p className="text-xs text-slate-500">{k}</p>
            <p className={`tabular mt-1 font-display text-lg font-bold sm:text-2xl ${cls}`}>{formatMoney(v as number)}</p>
          </Card>
        ))}
      </div>

      <Card>
        {invoices.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="Aucune facture" text="Créez une facture, envoyez-la par WhatsApp : votre client paie en ligne." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const st = invoiceStatus(inv);
              const url = `${origin}/facture/${inv.id}`;
              const total = invoiceTotal(inv);
              const msg = `Bonjour ${inv.clientName}, voici votre facture ${inv.number} de ${formatMoney(total)}. Payez en ligne ici : ${url}`;
              return (
                <li key={inv.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{inv.clientName}</p>
                      <Pill tone={INVOICE_STATUS[st].tone}>{INVOICE_STATUS[st].label}</Pill>
                    </div>
                    <p className="text-xs text-slate-500">
                      {inv.number} · échéance {formatDate(inv.dueDate, false)}
                    </p>
                  </div>
                  <p className="tabular font-display text-lg font-bold">{formatMoney(total)}</p>
                  <div className="flex items-center gap-1.5">
                    <CopyButton value={url} />
                    <a
                      href={`https://wa.me/${inv.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => inv.status === "draft" && updateInvoice(inv.id, { status: "sent" })}
                      className="flex h-9 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-sm font-medium text-white"
                    >
                      <MessageCircle className="h-4 w-4" /> Envoyer
                    </a>
                    {st !== "paid" && (
                      <Button size="sm" variant="secondary" className="h-9" onClick={() => updateInvoice(inv.id, { status: "paid" })}>
                        Marquer payée
                      </Button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <NewInvoice key={String(open)} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function NewInvoice({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addInvoice = useStore((s) => s.addInvoice);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ label: "", qty: 1, unitPrice: 0 }]);
  const [error, setError] = useState("");

  const setItem = (i: number, patch: Partial<InvoiceItem>) => setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const total = invoiceTotal({ items });

  const save = (status: "draft" | "sent") => {
    const clean = items.filter((i) => i.label.trim() && i.qty > 0 && i.unitPrice > 0);
    if (!clientName.trim()) return setError("Nom du client requis.");
    if (!clean.length) return setError("Ajoutez au moins une ligne complète.");
    addInvoice({ clientName: clientName.trim(), clientEmail, clientPhone, dueDate: new Date(dueDate + "T23:59:59").toISOString(), note, items: clean, status });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle facture" wide>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Client</Label>
            <Input placeholder="Nom ou entreprise" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input placeholder="+237 6 00 00 00 00" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Articles</Label>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-[1fr_64px_110px_32px] gap-2">
                <Input placeholder="Désignation" value={it.label} onChange={(e) => setItem(i, { label: e.target.value })} />
                <Input inputMode="numeric" aria-label="Quantité" value={it.qty || ""} onChange={(e) => setItem(i, { qty: Number(e.target.value.replace(/\D/g, "")) })} />
                <Input inputMode="numeric" aria-label="Prix unitaire" placeholder="Prix" value={it.unitPrice || ""} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value.replace(/\D/g, "")) })} />
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} disabled={items.length === 1} className="text-slate-400 hover:text-red-600 disabled:opacity-30" aria-label="Retirer la ligne">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setItems([...items, { label: "", qty: 1, unitPrice: 0 }])} className="mt-2 text-sm font-medium text-brand-700 hover:underline">
            + Ajouter une ligne
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Échéance</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex items-end justify-end">
            <p className="text-right">
              <span className="block text-xs text-slate-500">Total</span>
              <span className="tabular font-display text-2xl font-bold">{formatMoney(total)}</span>
            </p>
          </div>
        </div>
        <div>
          <Label hint="(optionnel)">Note</Label>
          <Textarea className="min-h-[70px]" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => save("draft")}>
            Enregistrer en brouillon
          </Button>
          <Button variant="dark" className="flex-1" onClick={() => save("sent")}>
            Créer la facture
          </Button>
        </div>
      </div>
    </Modal>
  );
}
