"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedInvoices, seedLinks, seedProfile, seedReferrals, seedTransactions } from "./seed";
import type { ApiKey, Invoice, PaymentLink, Profile, Referral, Transaction } from "./types";
import { shortCode, uid } from "./format";

type State = {
  authenticated: boolean;
  profile: Profile;
  links: PaymentLink[];
  transactions: Transaction[];
  invoices: Invoice[];
  apiKeys: ApiKey[];
  referrals: Referral[];
  bankRef: string;

  login: (email: string) => void;
  register: (p: Partial<Profile>) => void;
  logout: () => void;
  updateProfile: (p: Partial<Profile>) => void;

  addLink: (l: Omit<PaymentLink, "id" | "createdAt" | "updatedAt" | "views">) => PaymentLink;
  updateLink: (id: string, l: Partial<PaymentLink>) => void;
  deleteLink: (id: string) => void;
  viewLink: (id: string) => void;

  addTransaction: (t: Omit<Transaction, "id" | "date">) => Transaction;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;

  addInvoice: (i: Omit<Invoice, "id" | "number" | "createdAt">) => Invoice;
  updateInvoice: (id: string, i: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  createApiKey: (label: string, mode: ApiKey["mode"]) => ApiKey;
  revokeApiKey: (id: string) => void;

  resetDemo: () => void;
};

function initialData() {
  const links = seedLinks();
  return {
    profile: seedProfile(),
    links,
    transactions: seedTransactions(links),
    invoices: seedInvoices(),
    referrals: seedReferrals(),
    apiKeys: [] as ApiKey[],
    bankRef: shortCode(7),
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      authenticated: false,
      ...initialData(),

      login: (email) => set((s) => ({ authenticated: true, profile: { ...s.profile, email: email || s.profile.email } })),
      register: (p) => set((s) => ({ authenticated: true, profile: { ...s.profile, ...p } })),
      logout: () => set({ authenticated: false }),
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      addLink: (l) => {
        const now = new Date().toISOString();
        const link: PaymentLink = { ...l, id: uid(), createdAt: now, updatedAt: now, views: 0 };
        set((s) => ({ links: [link, ...s.links] }));
        return link;
      },
      updateLink: (id, l) =>
        set((s) => ({ links: s.links.map((x) => (x.id === id ? { ...x, ...l, updatedAt: new Date().toISOString() } : x)) })),
      deleteLink: (id) => set((s) => ({ links: s.links.filter((x) => x.id !== id) })),
      viewLink: (id) => set((s) => ({ links: s.links.map((x) => (x.id === id ? { ...x, views: x.views + 1 } : x)) })),

      addTransaction: (t) => {
        const tx: Transaction = { ...t, id: uid(), date: new Date().toISOString() };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
        return tx;
      },
      updateTransaction: (id, t) => {
        const prev = get().transactions.find((x) => x.id === id);
        set((s) => ({ transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)) }));
        // Effets de bord d'un paiement réussi : stock et facture.
        if (prev && prev.status !== "success" && t.status === "success") {
          if (prev.source.type === "link") {
            const link = get().links.find((l) => l.id === prev.source.refId);
            if (link && link.stock !== null) get().updateLink(link.id, { stock: Math.max(0, link.stock - 1) });
          }
          if (prev.source.type === "invoice") get().updateInvoice(prev.source.refId, { status: "paid" });
        }
      },

      addInvoice: (i) => {
        const year = new Date().getFullYear();
        const n = get().invoices.length + 1;
        const inv: Invoice = { ...i, id: uid(), number: `FAC-${year}-${String(n).padStart(4, "0")}`, createdAt: new Date().toISOString() };
        set((s) => ({ invoices: [inv, ...s.invoices] }));
        return inv;
      },
      updateInvoice: (id, i) => set((s) => ({ invoices: s.invoices.map((x) => (x.id === id ? { ...x, ...i } : x)) })),
      deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),

      createApiKey: (label, mode) => {
        const key: ApiKey = {
          id: uid(),
          label,
          mode,
          publicKey: `pk_${mode}_${shortCode(24)}`,
          secretKey: `sk_${mode}_${shortCode(32)}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ apiKeys: [key, ...s.apiKeys] }));
        return key;
      },
      revokeApiKey: (id) => set((s) => ({ apiKeys: s.apiKeys.filter((k) => k.id !== id) })),

      resetDemo: () => set({ ...initialData() }),
    }),
    {
      name: "paylinko-store-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** Solde disponible : encaissements réussis nets de frais, moins les retraits. */
export function computeBalance(txs: Transaction[]) {
  return txs.reduce((sum, t) => {
    if (t.status !== "success") return sum;
    return t.direction === "in" ? sum + t.amount - t.fee : sum - t.amount;
  }, 0);
}
