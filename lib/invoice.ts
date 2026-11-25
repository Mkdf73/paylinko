import type { Invoice } from "./types";

export function invoiceTotal(inv: Pick<Invoice, "items">) {
  return inv.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

export function invoiceStatus(inv: Invoice): "draft" | "sent" | "paid" | "overdue" {
  if (inv.status === "sent" && new Date(inv.dueDate).getTime() < Date.now()) return "overdue";
  return inv.status;
}

export const INVOICE_STATUS: Record<ReturnType<typeof invoiceStatus>, { label: string; tone: "slate" | "brand" | "green" | "red" }> = {
  draft: { label: "Brouillon", tone: "slate" },
  sent: { label: "Envoyée", tone: "brand" },
  paid: { label: "Payée", tone: "green" },
  overdue: { label: "En retard", tone: "red" },
};
