"use client";

import clsx from "clsx";
import {
  ArrowLeftRight,
  AtSign,
  Code2,
  FileText,
  HelpCircle,
  Home,
  Landmark,
  Link2,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "./ui";

type Item = { href: string; label: string; icon: typeof Home; children?: { href: string; label: string; icon: typeof Home }[] };

const NAV: Item[] = [
  {
    href: "/dashboard",
    label: "Général",
    icon: Home,
    children: [
      { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/dashboard/liens", label: "Liens", icon: Link2 },
    ],
  },
  {
    href: "/dashboard/compte-bancaire",
    label: "Compte bancaire",
    icon: Landmark,
    children: [{ href: "/dashboard/factures", label: "Factures", icon: FileText }],
  },
  { href: "/dashboard/tag", label: "Tag", icon: AtSign },
  { href: "/dashboard/affiliation", label: "Affiliation", icon: Users },
  { href: "/dashboard/configurations", label: "Configurations", icon: Settings },
  { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition",
                active ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
            {item.children && (
              <div className="ml-[22px] mt-0.5 space-y-0.5 border-l border-slate-200 pl-3">
                {item.children.map((c) => {
                  const ca = isActive(pathname, c.href);
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={onNavigate}
                      className={clsx(
                        "block rounded-lg px-3 py-1.5 text-sm transition",
                        ca ? "font-semibold text-ink" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function UserFooter({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const logout = useStore((s) => s.logout);
  const dev = isActive(pathname, "/dashboard/developpeurs");
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/developpeurs"
        onClick={onNavigate}
        className={clsx(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px]",
          dev ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-700 hover:bg-slate-100"
        )}
      >
        <Code2 className="h-[18px] w-[18px]" /> Développeurs
      </Link>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {(profile.firstName[0] ?? "") + (profile.lastName[0] ?? "")}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{profile.businessName || `${profile.firstName} ${profile.lastName}`}</p>
          <p className="truncate text-xs text-slate-500">{profile.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/connexion");
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-slate-50/80 px-4 py-5 lg:flex">
      <div>
        <Link href="/dashboard" className="mb-8 block px-2">
          <Logo />
        </Link>
        <NavList />
      </div>
      <UserFooter />
    </aside>
  );
}

export function MobileTopbar({ crumbs }: { crumbs: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="lg:hidden">
            <Logo className="[&_span.text-xl]:text-lg" />
          </Link>
          <div className="hidden min-w-0 lg:block">{crumbs}</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>
      <div className="border-b border-slate-200 bg-white px-4 py-2 lg:hidden">{crumbs}</div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="animate-in absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col justify-between overflow-y-auto bg-white px-4 py-5">
            <div>
              <div className="mb-6 flex items-center justify-between px-2">
                <Logo />
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Fermer le menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-6">
              <UserFooter onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
