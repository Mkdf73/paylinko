"use client";

import { Spinner } from "./ui";
import { useHydrated } from "@/lib/hooks";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated)
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  return (
    <div className="min-h-screen bg-white">
      {children}
      <footer className="pb-8 text-center text-xs text-slate-400">
        Propulsé par <span className="font-semibold text-slate-600">Paylinko</span> · Paiements Mobile Money sécurisés
      </footer>
    </div>
  );
}

export function NotFoundCard({ text }: { text: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-2xl font-bold">Oups…</p>
      <p className="mt-2 text-slate-500">{text}</p>
    </div>
  );
}
