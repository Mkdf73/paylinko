"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Button, Input, Label, Select } from "@/components/ui";
import { COUNTRIES, COUNTRY_BY_CODE } from "@/lib/countries";
import { slugify } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useStore((s) => s.register);
  const [f, setF] = useState({ firstName: "", lastName: "", businessName: "", email: "", country: "CI", password: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <AuthCard
      title="Créez votre compte"
      subtitle="Gratuit, sans engagement. Encaissez dès aujourd'hui."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-semibold text-brand-700 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.firstName || !f.lastName) return setError("Nom et prénom requis.");
          if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Email invalide.");
          if (f.password.length < 8) return setError("Le mot de passe doit faire au moins 8 caractères.");
          const c = COUNTRY_BY_CODE[f.country];
          register({
            firstName: f.firstName,
            lastName: f.lastName,
            businessName: f.businessName || `${f.firstName} ${f.lastName}`,
            email: f.email,
            country: f.country,
            payoutOperator: c.operators[0],
            tag: slugify(f.businessName || f.firstName + f.lastName) || "boutique",
          });
          router.push("/dashboard");
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Prénom</Label>
            <Input autoComplete="given-name" value={f.firstName} onChange={set("firstName")} />
          </div>
          <div>
            <Label>Nom</Label>
            <Input autoComplete="family-name" value={f.lastName} onChange={set("lastName")} />
          </div>
        </div>
        <div>
          <Label hint="(optionnel)">Nom de la boutique</Label>
          <Input value={f.businessName} onChange={set("businessName")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" autoComplete="email" value={f.email} onChange={set("email")} />
        </div>
        <div>
          <Label>Pays</Label>
          <Select value={f.country} onChange={set("country")}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input type="password" autoComplete="new-password" value={f.password} onChange={set("password")} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="dark" size="lg" className="w-full">
          Créer mon compte
        </Button>
      </form>
    </AuthCard>
  );
}
