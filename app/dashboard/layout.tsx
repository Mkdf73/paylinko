"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MobileTopbar, Sidebar } from "@/components/Sidebar";
import { Spinner } from "@/components/ui";
import { useHydrated } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const authenticated = useStore((s) => s.authenticated);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !authenticated) router.replace("/connexion");
  }, [hydrated, authenticated, router]);

  if (!hydrated || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-white lg:rounded-l-3xl lg:border-l lg:border-slate-200">
        <MobileTopbar crumbs={<Breadcrumbs />} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
