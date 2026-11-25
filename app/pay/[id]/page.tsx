"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Checkout } from "@/components/Checkout";
import { NotFoundCard, PublicShell } from "@/components/PublicShell";
import { linkUnavailableReason } from "@/lib/format";
import { useStore } from "@/lib/store";

function PayLink({ id }: { id: string }) {
  const router = useRouter();
  const link = useStore((s) => s.links.find((l) => l.id === id));
  const profile = useStore((s) => s.profile);
  const viewLink = useStore((s) => s.viewLink);
  const addTransaction = useStore((s) => s.addTransaction);

  useEffect(() => {
    viewLink(id);
  }, [id, viewLink]);

  if (!link) return <NotFoundCard text="Ce lien de paiement est introuvable." />;

  return (
    <Checkout
      title={link.name}
      description={link.description}
      images={link.images}
      price={link.priceType === "fixed" ? link.price : null}
      merchant={profile.businessName}
      feesPaidBy={profile.feesPaidBy}
      collectAddress={link.collectAddress}
      unavailable={linkUnavailableReason(link)}
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
          source: { type: "link", refId: link.id, label: link.name },
        });
        router.push(`/paiement/${tx.id}`);
      }}
    />
  );
}

export default function PayPage({ params }: { params: { id: string } }) {
  return (
    <PublicShell>
      <PayLink id={params.id} />
    </PublicShell>
  );
}
