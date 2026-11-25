"use client";

import { useRouter } from "next/navigation";
import { Checkout } from "@/components/Checkout";
import { NotFoundCard, PublicShell } from "@/components/PublicShell";
import { useStore } from "@/lib/store";

function TagPay({ tag }: { tag: string }) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const addTransaction = useStore((s) => s.addTransaction);
  if (profile.tag !== tag.toLowerCase()) return <NotFoundCard text={`Aucun marchand avec le tag @${tag}.`} />;

  return (
    <Checkout
      title={`Payer @${profile.tag}`}
      description={`${profile.businessName} — saisissez le montant convenu et payez avec votre Mobile Money.`}
      price={null}
      merchant={profile.businessName}
      feesPaidBy={profile.feesPaidBy}
      onPay={(p) => {
        const tx = addTransaction({
          status: "pending",
          direction: "in",
          customerName: p.name,
          customerEmail: p.email,
          customerPhone: p.phone,
          country: p.country,
          operator: p.operator,
          amount: p.amount,
          localAmount: p.localAmount,
          currency: p.currency,
          fee: p.fee,
          source: { type: "tag", refId: profile.tag, label: `Tag @${profile.tag}` },
        });
        router.push(`/paiement/${tx.id}`);
      }}
    />
  );
}

export default function TagPublicPage({ params }: { params: { tag: string } }) {
  return (
    <PublicShell>
      <TagPay tag={params.tag} />
    </PublicShell>
  );
}
