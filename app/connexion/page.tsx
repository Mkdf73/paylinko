"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState("demo@paylinko.app");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <AuthCard
      title="Bon retour 👋"
      subtitle="Connectez-vous pour gérer vos paiements."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Email invalide.");
          if (password.length < 6) return setError("Mot de passe trop court.");
          setError("");
          setLoading(true);
          setTimeout(() => {
            login(email);
            router.push("/dashboard");
          }, 500);
        }}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="pw">Mot de passe</Label>
          <Input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="dark" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Se connecter"}
        </Button>
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Démo : identifiants pré-remplis, n&apos;importe quel email fonctionne.</p>
      </form>
    </AuthCard>
  );
}
