"use client";

import { LinkForm } from "@/components/LinkForm";
import { PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function EditLinkPage({ params }: { params: { id: string } }) {
  const link = useStore((s) => s.links.find((l) => l.id === params.id));
  if (!link) return <p className="text-slate-500">Lien introuvable.</p>;
  return (
    <>
      <PageHeader title="Modifier le lien" subtitle={link.name} />
      <LinkForm initial={link} />
    </>
  );
}
