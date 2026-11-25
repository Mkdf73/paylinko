import Link from "next/link";
import { Logo } from "./ui";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="mt-10 font-display text-3xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <p className="max-w-md font-display text-4xl font-bold leading-tight">Un lien. Tous les Mobile Money d&apos;Afrique.</p>
          <p className="mt-4 max-w-md text-white/60">Orange Money, MTN MoMo, Wave, M-Pesa, Moov, Airtel… Vos clients paient comme ils veulent, vous encaissez en XOF.</p>
        </div>
      </div>
    </div>
  );
}
