"use client";

import { LinkForm } from "@/components/LinkForm";
import { PageHeader } from "@/components/ui";

export default function CreateLinkPage() {
  return (
    <>
      <PageHeader title="Créer lien de paiement" subtitle="Collectez des paiements à travers plus de 15 pays avec vos liens de paiement." />
      <LinkForm />
    </>
  );
}
