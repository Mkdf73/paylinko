import { createRoot } from "react-dom/client";
import { ORIGIN, RouterProvider, useRouterCtx } from "./router";

import Home from "@/app/page";
import Login from "@/app/connexion/page";
import Register from "@/app/inscription/page";
import DashboardLayout from "@/app/dashboard/layout";
import Dashboard from "@/app/dashboard/page";
import Transactions from "@/app/dashboard/transactions/page";
import Links from "@/app/dashboard/liens/page";
import CreateLink from "@/app/dashboard/liens/creer/page";
import LinkDetail from "@/app/dashboard/liens/[id]/page";
import EditLink from "@/app/dashboard/liens/[id]/modifier/page";
import Bank from "@/app/dashboard/compte-bancaire/page";
import Invoices from "@/app/dashboard/factures/page";
import Tag from "@/app/dashboard/tag/page";
import Affiliation from "@/app/dashboard/affiliation/page";
import Settings from "@/app/dashboard/configurations/page";
import Faq from "@/app/dashboard/faq/page";
import Dev from "@/app/dashboard/developpeurs/page";
import Pay from "@/app/pay/[id]/page";
import PaymentStatus from "@/app/paiement/[txId]/page";
import TagPublic from "@/app/t/[tag]/page";
import InvoicePublic from "@/app/facture/[id]/page";

(window as unknown as { __PL_ORIGIN__: string }).__PL_ORIGIN__ = ORIGIN;

type Route = { re: RegExp; keys: string[]; render: (p: Record<string, string>) => React.ReactNode; dash?: boolean };
const r = (pattern: string, render: Route["render"], dash = false): Route => {
  const keys: string[] = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "/?$");
  return { re, keys, render, dash };
};

const ROUTES: Route[] = [
  r("/", () => <Home />),
  r("/connexion", () => <Login />),
  r("/inscription", () => <Register />),
  r("/dashboard", () => <Dashboard />, true),
  r("/dashboard/transactions", () => <Transactions />, true),
  r("/dashboard/liens", () => <Links />, true),
  r("/dashboard/liens/creer", () => <CreateLink />, true),
  r("/dashboard/liens/:id/modifier", (p) => <EditLink params={{ id: p.id }} />, true),
  r("/dashboard/liens/:id", (p) => <LinkDetail params={{ id: p.id }} />, true),
  r("/dashboard/compte-bancaire", () => <Bank />, true),
  r("/dashboard/factures", () => <Invoices />, true),
  r("/dashboard/tag", () => <Tag />, true),
  r("/dashboard/affiliation", () => <Affiliation />, true),
  r("/dashboard/configurations", () => <Settings />, true),
  r("/dashboard/faq", () => <Faq />, true),
  r("/dashboard/developpeurs", () => <Dev />, true),
  r("/pay/:id", (p) => <Pay params={{ id: p.id }} />),
  r("/paiement/:txId", (p) => <PaymentStatus params={{ txId: p.txId }} />),
  r("/t/:tag", (p) => <TagPublic params={{ tag: p.tag }} />),
  r("/facture/:id", (p) => <InvoicePublic params={{ id: p.id }} />),
];

function Bar() {
  const { path, push, back } = useRouterCtx();
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
      <button onClick={back} className="rounded px-2 py-0.5 hover:bg-white" aria-label="Retour">←</button>
      <button onClick={() => push("/")} className="rounded px-2 py-0.5 hover:bg-white">Accueil</button>
      <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-0.5">paylinko.app{path}</code>
    </div>
  );
}

function App() {
  const { path } = useRouterCtx();
  for (const route of ROUTES) {
    const m = path.match(route.re);
    if (!m) continue;
    const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const page = route.render(params);
    return route.dash ? <DashboardLayout key="dash">{page}</DashboardLayout> : <>{page}</>;
  }
  return <div className="p-10 text-center text-slate-500">Page introuvable.</div>;
}

createRoot(document.getElementById("root")!).render(
  <RouterProvider>
    <Bar />
    <App />
  </RouterProvider>
);
