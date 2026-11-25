import { ArrowRight, Check, FileText, Globe2, Link2, QrCode, ShieldCheck, Smartphone, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";

const FEATURES = [
  { icon: Link2, title: "Liens de paiement", text: "Un produit, un prix, un lien. Partagez-le sur WhatsApp, Instagram ou TikTok." },
  { icon: Globe2, title: "Compte EUR & USD", text: "Un IBAN européen et un compte américain pour être payé par vos clients à l'étranger." },
  { icon: Wallet, title: "Retrait instantané", text: "Votre argent sur votre Mobile Money en quelques secondes, sans frais de retrait." },
  { icon: FileText, title: "Factures payables", text: "Envoyez une facture par WhatsApp, votre client la règle en ligne." },
  { icon: QrCode, title: "Tag & QR code", text: "Votre page de paiement personnelle à afficher en boutique." },
  { icon: Zap, title: "API & webhooks", text: "Branchez Paylinko à votre site, application ou boutique Shopify." },
];

const STEPS = [
  ["Créez votre lien", "Photos, prix, description : en moins d'une minute."],
  ["Partagez-le", "Par WhatsApp, SMS, réseaux sociaux ou QR code."],
  ["Encaissez", "Le client paie avec son Mobile Money, vous êtes notifié."],
];

export default function Home() {
  return (
    <div className="bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/connexion" className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block">
              Se connecter
            </Link>
            <Link href="/inscription" className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft">
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-200/60 blur-3xl" />
        <div className="absolute -left-40 top-40 h-[380px] w-[380px] rounded-full bg-accent-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> {COUNTRIES.length} pays · tous les Mobile Money
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Encaissez partout en Afrique avec un simple lien.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Créez un lien de paiement, partagez-le, et recevez l&apos;argent de vos clients par Orange Money, MTN MoMo, Wave, M-Pesa et plus — sans site web, sans terminal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/inscription" className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-medium text-white hover:bg-brand-700">
                Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/connexion" className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-6 font-medium hover:bg-slate-50">
                Voir la démo
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {["Sans abonnement", "2,5 % par vente", "Retrait instantané"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Maquette téléphone */}
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="rounded-[2.5rem] bg-ink p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-white">
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800 font-display text-2xl font-bold text-white">Pagne wax</div>
                <div className="space-y-3 p-5">
                  <p className="font-display text-lg font-bold">Pagne wax premium</p>
                  <p className="tabular text-2xl font-bold">
                    34 534 <sup className="text-xs">XOF</sup>
                  </p>
                  <div className="h-10 rounded-xl border border-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-10 w-20 rounded-xl border border-slate-200" />
                    <div className="h-10 flex-1 rounded-xl border border-slate-200" />
                  </div>
                  <div className="flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-white">Payer</div>
                </div>
              </div>
            </div>
            <div className="absolute -left-10 top-16 hidden rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-100 sm:block">
              <p className="text-xs text-slate-500">Paiement reçu</p>
              <p className="tabular font-display font-bold text-emerald-600">+34 534 XOF</p>
            </div>
            <div className="absolute -right-8 bottom-24 hidden items-center gap-2 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-100 sm:flex">
              <Smartphone className="h-5 w-5 text-brand-600" />
              <span className="text-xs font-medium">Wave · Sénégal</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 text-2xl">
          {COUNTRIES.map((c) => (
            <span key={c.code} title={c.name}>
              {c.flag}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-xl font-display text-3xl font-bold text-ink sm:text-4xl">Tout ce qu&apos;il faut pour vendre en ligne, depuis votre téléphone.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl border border-slate-200 p-6 transition hover:border-brand-200 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Comment ça marche</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <div key={t} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="font-display text-4xl font-bold text-accent-400">0{i + 1}</span>
                <p className="mt-3 text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm text-white/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <ShieldCheck className="mx-auto h-10 w-10 text-brand-600" />
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold text-ink sm:text-4xl">Prêt à recevoir votre premier paiement ?</h2>
        <Link href="/inscription" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-medium text-white hover:bg-brand-700">
          Commencer gratuitement <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <Logo className="scale-90" />
          <p>© {new Date().getFullYear()} Paylinko. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
