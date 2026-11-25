import { COUNTRIES, computeFee, convertFromXOF } from "./countries";
import type { Invoice, PaymentLink, Profile, Referral, Transaction, TxStatus } from "./types";

// Générateur pseudo-aléatoire déterministe pour des données de démo stables.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const FIRST = ["Aïcha", "Koffi", "Mariam", "Yao", "Fatou", "Jean", "Awa", "Moussa", "Grâce", "Ibrahim", "Nadège", "Serge", "Ama", "Cheikh", "Divine", "Patrick"];
const LAST = ["Traoré", "Kouassi", "Diop", "Mensah", "Ndiaye", "Kamga", "Ouédraogo", "Bamba", "Mbarga", "Sow", "Agbodjan", "Kabila", "Tchoumi", "Faye"];

function hex(r: () => number, n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(r() * 16).toString(16);
  return s;
}

function fakeId(r: () => number) {
  return `${hex(r, 8)}-${hex(r, 4)}-4${hex(r, 3)}-${hex(r, 4)}-${hex(r, 12)}`;
}

export function seedProfile(): Profile {
  return {
    firstName: "Mogo",
    lastName: "Kamdem",
    email: "demo@paylinko.app",
    phone: "+237 6 90 00 00 00",
    country: "CM",
    businessName: "Kamdem Matériaux",
    tag: "kamdem",
    referralCode: "KAMDEM24",
    payoutOperator: "MTN MoMo",
    payoutNumber: "690000000",
    webhookUrl: "",
    notifyEmail: true,
    notifySms: false,
    feesPaidBy: "merchant",
  };
}

const PLACEHOLDER_IMG = (label: string, bg: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='800' height='600' fill='${bg}'/><text x='50%' y='50%' font-family='sans-serif' font-size='48' font-weight='700' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  );

export function seedLinks(now = new Date()): PaymentLink[] {
  const r = rng(7);
  const mk = (
    name: string,
    description: string,
    price: number,
    daysAgo: number,
    img: [string, string],
    extra: Partial<PaymentLink> = {}
  ): PaymentLink => {
    const created = new Date(now.getTime() - daysAgo * 864e5).toISOString();
    return {
      id: fakeId(r),
      name,
      description,
      priceType: "fixed",
      price,
      images: [PLACEHOLDER_IMG(img[0], img[1])],
      files: [],
      status: "active",
      stock: null,
      expiresAt: null,
      redirectUrl: "",
      collectAddress: false,
      createdAt: created,
      updatedAt: created,
      views: Math.floor(r() * 400) + 20,
      ...extra,
    };
  };
  return [
    mk("10 sacs de ciment", "Les meilleurs sacs de ciment de la région, livrés sous 48h.", 50000, 3, ["Ciment 25kg", "#6f47fb"], { stock: 40, collectAddress: true }),
    mk("Formation e-commerce", "8 modules vidéo + groupe privé pour lancer votre boutique en ligne.", 20000, 40, ["Formation", "#f5a524"]),
    mk("Pagne wax premium", "6 yards, 100 % coton, motifs exclusifs.", 34534, 120, ["Wax", "#0f9d74"]),
    mk("Don – Association Espoir", "Soutenez nos actions éducatives. Montant libre.", 0, 200, ["Don", "#e0457b"], { priceType: "free" }),
    mk("Coaching 1h", "Séance individuelle en visio.", 4855, 170, ["Coaching", "#2b6cb0"], { status: "inactive" }),
  ];
}

export function seedTransactions(links: PaymentLink[], now = new Date()): Transaction[] {
  const r = rng(42);
  const txs: Transaction[] = [];
  const statuses: TxStatus[] = ["success", "success", "success", "success", "success", "not_collected", "failed", "success", "pending"];
  for (let i = 0; i < 64; i++) {
    const link = links[Math.floor(r() * links.length)];
    const country = COUNTRIES[Math.floor(r() * COUNTRIES.length)];
    const daysAgo = Math.floor(Math.pow(r(), 1.6) * 360);
    const date = new Date(now.getTime() - daysAgo * 864e5 - Math.floor(r() * 864e5));
    const amount = link.priceType === "free" ? Math.round((r() * 30000 + 1000) / 500) * 500 : link.price;
    const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
    const status = statuses[Math.floor(r() * statuses.length)];
    const digits = Array.from({ length: 8 }, () => Math.floor(r() * 10)).join("");
    txs.push({
      id: fakeId(r),
      status,
      direction: "in",
      date: date.toISOString(),
      customerName: name,
      customerEmail: name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(" ", ".") + "@exemple.com",
      customerPhone: `${country.dial} ${digits.replace(/(\d{2})(?=\d)/g, "$1 ")}`,
      country: country.code,
      operator: country.operators[Math.floor(r() * country.operators.length)],
      amount,
      localAmount: convertFromXOF(amount, country),
      currency: country.currency,
      fee: computeFee(amount),
      source: { type: "link", refId: link.id, label: link.name },
    });
  }
  // Un retrait passé
  txs.push({
    id: fakeId(r),
    status: "success",
    direction: "out",
    date: new Date(now.getTime() - 20 * 864e5).toISOString(),
    customerName: "Retrait vers MTN MoMo",
    customerEmail: "",
    customerPhone: "+237 690 00 00 00",
    country: "CM",
    operator: "MTN MoMo",
    amount: 150000,
    localAmount: 150000,
    currency: "XAF",
    fee: 0,
    source: { type: "withdrawal", refId: "", label: "Retrait" },
  });
  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

export function seedInvoices(now = new Date()): Invoice[] {
  return [
    {
      id: "inv-demo-1",
      number: "FAC-2026-0001",
      clientName: "BTP Nyanga SARL",
      clientEmail: "compta@nyanga.cm",
      clientPhone: "+237 6 77 00 00 00",
      items: [
        { label: "Sacs de ciment 25 kg", qty: 120, unitPrice: 5000 },
        { label: "Livraison", qty: 1, unitPrice: 25000 },
      ],
      dueDate: new Date(now.getTime() + 10 * 864e5).toISOString(),
      note: "Merci pour votre confiance.",
      status: "sent",
      createdAt: new Date(now.getTime() - 2 * 864e5).toISOString(),
    },
  ];
}

export function seedReferrals(now = new Date()): Referral[] {
  return [
    { id: "r1", name: "Boutique Awa Style", joinedAt: new Date(now.getTime() - 60 * 864e5).toISOString(), volume: 820000 },
    { id: "r2", name: "Tech Hub Lomé", joinedAt: new Date(now.getTime() - 15 * 864e5).toISOString(), volume: 145000 },
  ];
}
