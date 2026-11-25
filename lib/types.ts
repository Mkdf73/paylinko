export type TxStatus = "success" | "pending" | "failed" | "not_collected";

export type TxSource =
  | { type: "link"; refId: string; label: string }
  | { type: "invoice"; refId: string; label: string }
  | { type: "tag"; refId: string; label: string }
  | { type: "bank"; refId: string; label: string }
  | { type: "withdrawal"; refId: string; label: string };

export type Transaction = {
  id: string;
  status: TxStatus;
  direction: "in" | "out";
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  country: string;
  operator: string;
  /** Montant en XOF reçu (ou retiré) par le marchand. */
  amount: number;
  /** Montant réellement payé par l'acheteur dans sa devise. */
  localAmount: number;
  currency: string;
  fee: number;
  source: TxSource;
};

export type LinkFile = { name: string; size: number };

export type PaymentLink = {
  id: string;
  name: string;
  description: string;
  priceType: "fixed" | "free";
  price: number;
  images: string[];
  files: LinkFile[];
  status: "active" | "inactive";
  stock: number | null;
  expiresAt: string | null;
  redirectUrl: string;
  collectAddress: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
};

export type InvoiceItem = { label: string; qty: number; unitPrice: number };

export type Invoice = {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  dueDate: string;
  note: string;
  status: "draft" | "sent" | "paid";
  createdAt: string;
};

export type ApiKey = {
  id: string;
  label: string;
  mode: "test" | "live";
  publicKey: string;
  secretKey: string;
  createdAt: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  businessName: string;
  tag: string;
  referralCode: string;
  payoutOperator: string;
  payoutNumber: string;
  webhookUrl: string;
  notifyEmail: boolean;
  notifySms: boolean;
  feesPaidBy: "merchant" | "customer";
};

export type Referral = { id: string; name: string; joinedAt: string; volume: number };
