"use client";

import { Eye, EyeOff, KeyRound, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Pill } from "@/components/StatusBadge";
import { Button, Card, CopyButton, EmptyState, Input, Label, Modal, PageHeader, Select } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function DevelopersPage() {
  const keys = useStore((s) => s.apiKeys);
  const createApiKey = useStore((s) => s.createApiKey);
  const revokeApiKey = useStore((s) => s.revokeApiKey);
  const profile = useStore((s) => s.profile);
  const update = useStore((s) => s.updateProfile);
  const origin = useOrigin();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Ma boutique");
  const [mode, setMode] = useState<"test" | "live">("test");
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [webhook, setWebhook] = useState(profile.webhookUrl);

  const sample = `curl -X POST ${origin}/api/v1/payment-links \\
  -H "Authorization: Bearer ${keys[0]?.secretKey ?? "sk_test_..."}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "10 sacs de ciment",
    "amount": 50000,
    "currency": "XOF",
    "redirect_url": "https://monsite.com/merci"
  }'`;

  return (
    <>
      <PageHeader
        title="Développeurs"
        subtitle="Intégrez Paylinko à votre site, application ou boutique Shopify."
        actions={
          <Button variant="dark" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle clé
          </Button>
        }
      />

      <Card>
        <p className="border-b border-slate-100 px-5 py-3 font-semibold">Clés API</p>
        {keys.length === 0 ? (
          <EmptyState icon={<KeyRound className="h-6 w-6" />} title="Aucune clé API" text="Créez une clé de test pour commencer votre intégration." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {keys.map((k) => (
              <li key={k.id} className="space-y-2 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{k.label}</p>
                    <Pill tone={k.mode === "live" ? "green" : "amber"}>{k.mode === "live" ? "Production" : "Test"}</Pill>
                  </div>
                  <button onClick={() => revokeApiKey(k.id)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Révoquer
                  </button>
                </div>
                <KeyRow label="Publique" value={k.publicKey} />
                <KeyRow
                  label="Secrète"
                  value={shown[k.id] ? k.secretKey : k.secretKey.slice(0, 8) + "•".repeat(24)}
                  copy={k.secretKey}
                  extra={
                    <button onClick={() => setShown({ ...shown, [k.id]: !shown[k.id] })} className="p-1.5 text-slate-500" aria-label="Afficher la clé">
                      {shown[k.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
                <p className="text-xs text-slate-400">Créée le {formatDate(k.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-5 p-5">
        <p className="font-semibold">Webhook</p>
        <p className="mb-3 text-sm text-slate-500">
          Paylinko enverra un <code className="rounded bg-slate-100 px-1">POST</code> à cette URL à chaque changement de statut d&apos;une transaction.
        </p>
        <div className="flex gap-2">
          <Input placeholder="https://monsite.com/webhooks/paylinko" value={webhook} onChange={(e) => setWebhook(e.target.value)} />
          <Button variant="secondary" onClick={() => update({ webhookUrl: webhook })} disabled={webhook === profile.webhookUrl}>
            Enregistrer
          </Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-hidden">
        <p className="border-b border-slate-100 px-5 py-3 font-semibold">Exemple : créer un lien de paiement</p>
        <pre className="overflow-x-auto bg-ink p-5 text-xs leading-relaxed text-emerald-200">{sample}</pre>
        <p className="px-5 py-3 text-xs text-amber-700">Aperçu de l&apos;API prévue — les endpoints seront actifs une fois le backend branché.</p>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle clé API">
        <div className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label>Environnement</Label>
            <Select value={mode} onChange={(e) => setMode(e.target.value as "test" | "live")}>
              <option value="test">Test</option>
              <option value="live">Production</option>
            </Select>
          </div>
          <Button
            variant="dark"
            className="w-full"
            onClick={() => {
              createApiKey(label || "Clé", mode);
              setOpen(false);
            }}
          >
            Générer
          </Button>
        </div>
      </Modal>
    </>
  );
}

function KeyRow({ label, value, copy, extra }: { label: string; value: string; copy?: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
      <span className="w-16 shrink-0 text-xs text-slate-500">{label}</span>
      <code className="flex-1 truncate text-xs">{value}</code>
      {extra}
      <CopyButton value={copy ?? value} className="h-7 border-0 bg-transparent" />
    </div>
  );
}
