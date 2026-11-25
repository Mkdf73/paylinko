"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

const LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  transactions: "Transactions",
  liens: "Liens de paiement",
  creer: "Créer",
  "compte-bancaire": "Compte bancaire",
  factures: "Factures",
  nouvelle: "Nouvelle",
  tag: "Tag",
  affiliation: "Affiliation",
  configurations: "Configurations",
  faq: "FAQ",
  developpeurs: "Développeurs",
  modifier: "Modifier",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Fil d'Ariane">
      {parts.map((p, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const last = i === parts.length - 1;
        const label = LABELS[p] ?? (p.length > 14 ? p.slice(0, 8) + "…" : p);
        return (
          <Fragment key={href}>
            {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
            {last ? (
              <span className="truncate font-medium text-ink">{label}</span>
            ) : (
              <Link href={href} className="truncate text-slate-500 hover:text-slate-800">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
