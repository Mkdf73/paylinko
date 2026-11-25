"use client";

import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";

const FAQ: [string, string][] = [
  ["Comment créer un lien de paiement ?", "Allez dans Liens → « Créer un lien ». Ajoutez des photos, un nom, un prix et une description, puis cliquez sur « Créer le lien ». Copiez le lien ou partagez-le directement sur WhatsApp."],
  ["Quels pays et opérateurs sont couverts ?", `Vos clients peuvent payer depuis ${COUNTRIES.length} pays : ${COUNTRIES.map((c) => c.name).join(", ")}. Orange Money, MTN MoMo, Moov, Wave, M-Pesa, Airtel Money et d'autres sont pris en charge.`],
  ["Combien coûte Paylinko ?", "Aucun abonnement. 2,5 % par paiement réussi. Vous pouvez choisir dans Configurations de faire payer ces frais au client."],
  ["Comment retirer mon argent ?", "Depuis le tableau de bord, cliquez sur « Retirer ». Les fonds sont envoyés instantanément sur votre numéro Mobile Money, sans frais de retrait."],
  ["Qu'est-ce que le compte bancaire virtuel ?", "Après vérification de votre identité, vous obtenez un IBAN européen (EUR) et un compte américain (USD). Vos clients à l'étranger vous paient par virement : l'argent est converti en XOF et crédité sur votre solde. Demandez-leur d'indiquer votre code de référence."],
  ["Que signifie « Non collecté » ?", "Le client a lancé le paiement mais ne l'a pas validé sur son téléphone dans les 5 minutes. Aucun montant n'a été débité ; il peut réessayer."],
  ["À quoi sert le Tag ?", "C'est votre page de paiement personnelle (paylinko.app/t/votre-tag). Le client saisit lui-même le montant : idéal en boutique, pour les services ou les dons."],
  ["Puis-je intégrer Paylinko à mon site ou à Shopify ?", "Oui : la section Développeurs fournit des clés API et des webhooks. Vous pouvez aussi simplement rediriger vos clients vers un lien de paiement."],
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHeader title="FAQ et guide" subtitle="Les réponses aux questions les plus fréquentes." />
      <Card className="divide-y divide-slate-100">
        {FAQ.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium" aria-expanded={open === i}>
              {q}
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="animate-in px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</p>}
          </div>
        ))}
      </Card>
      <Card className="mt-5 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Vous ne trouvez pas votre réponse ?</p>
          <p className="text-sm text-slate-500">Notre équipe répond 7j/7 sur WhatsApp.</p>
        </div>
        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white">
          <MessageCircle className="h-4 w-4" /> Contacter le support
        </a>
      </Card>
    </>
  );
}
