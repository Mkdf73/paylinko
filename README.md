# Paylinko

Plateforme d'encaissement pour l'Afrique : liens de paiement Mobile Money (16 pays), compte bancaire virtuel EUR/USD, factures payables, Tag personnel, affiliation et API.

Inspirée du parcours fonctionnel des outils de liens de paiement africains, avec une identité et des fonctionnalités propres à Paylinko.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de production
npm run build:artifact  # dist/paylinko-artifact.html : toute l'app en un seul fichier HTML
```

Connexion de démo : identifiants pré-remplis sur `/connexion`.

## Pages

| Espace marchand (`/dashboard`) | Pages publiques |
|---|---|
| Général : solde, retrait, KPIs, bilan | `/pay/[id]` : checkout d'un lien |
| Transactions : recherche, statut, filtres, export CSV | `/paiement/[txId]` : attente 5 min + reçu |
| Liens : création (Éditer / Aperçu), calculateur de taux, QR code, partage WhatsApp | `/t/[tag]` : page Tag à montant libre |
| Compte bancaire : IBAN EUR + compte USD (après KYC) | `/facture/[id]` : facture payable |
| Factures, Tag, Affiliation, Configurations, FAQ, Développeurs | `/`, `/connexion`, `/inscription` |

## Nouveautés par rapport au modèle de départ

- Solde + **retrait instantané** vers Mobile Money
- **QR code** téléchargeable et partage WhatsApp / SMS / Facebook
- **Montant libre** (dons, pourboires), **stock**, **date d'expiration**, **redirection** et **adresse de livraison** par lien
- **Factures** envoyées par WhatsApp et payables en ligne
- Choix de qui paie les **frais** (marchand ou client)
- Statistiques par lien : vues, ventes, conversion
- Détection du pays de l'acheteur, **interface mobile-first**

## État actuel (MVP démo)

- Les données sont stockées dans le navigateur (`localStorage`, store zustand dans `lib/store.ts`) : un lien de paiement ne fonctionne que dans le navigateur qui l'a créé.
- Aucun opérateur Mobile Money ni banque n'est branché : la page d'attente simule la réponse de l'opérateur, et les coordonnées bancaires sont fictives.
- Prochaines étapes : backend + base de données (auth, liens, transactions), intégration d'un agrégateur Mobile Money (webhooks), stockage des images/fichiers, KYC réel.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · zustand · Recharts · qrcode.react · lucide-react
