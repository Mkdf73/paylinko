export type Country = {
  code: string;
  name: string;
  flag: string;
  dial: string;
  currency: string;
  /** Combien d'unités de la devise locale pour 1 XOF (frais de change inclus). */
  rateFromXOF: number;
  operators: string[];
  /** Format indicatif du numéro, pour le placeholder. */
  phoneHint: string;
};

export const COUNTRIES: Country[] = [
  { code: "BJ", name: "Bénin", flag: "🇧🇯", dial: "+229", currency: "XOF", rateFromXOF: 1, operators: ["MTN MoMo", "Moov Money", "Celtiis Cash"], phoneHint: "01 00 00 00 00" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dial: "+226", currency: "XOF", rateFromXOF: 1, operators: ["Orange Money", "Moov Money"], phoneHint: "70 00 00 00" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", dial: "+237", currency: "XAF", rateFromXOF: 1, operators: ["MTN MoMo", "Orange Money"], phoneHint: "6 00 00 00 00" },
  { code: "CG", name: "Congo", flag: "🇨🇬", dial: "+242", currency: "XAF", rateFromXOF: 1, operators: ["MTN MoMo", "Airtel Money"], phoneHint: "06 000 0000" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩", dial: "+243", currency: "CDF", rateFromXOF: 4.2448, operators: ["M-Pesa", "Orange Money", "Airtel Money"], phoneHint: "81 000 0000" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225", currency: "XOF", rateFromXOF: 1, operators: ["Orange Money", "MTN MoMo", "Moov Money", "Wave"], phoneHint: "07 00 00 00 00" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dial: "+241", currency: "XAF", rateFromXOF: 1, operators: ["Airtel Money", "Moov Money"], phoneHint: "07 00 00 00" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", dial: "+224", currency: "GNF", rateFromXOF: 14.6, operators: ["Orange Money", "MTN MoMo"], phoneHint: "620 00 00 00" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dial: "+254", currency: "KES", rateFromXOF: 0.218, operators: ["M-Pesa", "Airtel Money"], phoneHint: "712 000 000" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dial: "+223", currency: "XOF", rateFromXOF: 1, operators: ["Orange Money", "Moov Money"], phoneHint: "70 00 00 00" },
  { code: "NE", name: "Niger", flag: "🇳🇪", dial: "+227", currency: "XOF", rateFromXOF: 1, operators: ["Airtel Money", "Moov Money"], phoneHint: "90 00 00 00" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", dial: "+250", currency: "RWF", rateFromXOF: 2.36, operators: ["MTN MoMo", "Airtel Money"], phoneHint: "78 000 0000" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dial: "+221", currency: "XOF", rateFromXOF: 1, operators: ["Orange Money", "Wave", "Free Money"], phoneHint: "77 000 00 00" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿", dial: "+255", currency: "TZS", rateFromXOF: 4.42, operators: ["M-Pesa", "Tigo Pesa", "Airtel Money"], phoneHint: "712 000 000" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dial: "+228", currency: "XOF", rateFromXOF: 1, operators: ["Flooz", "T-Money"], phoneHint: "90 00 00 00" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬", dial: "+256", currency: "UGX", rateFromXOF: 6.25, operators: ["MTN MoMo", "Airtel Money"], phoneHint: "772 000 000" },
];

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

/** Montant que l'acheteur paie dans sa devise pour que le marchand reçoive `xof`. */
export function convertFromXOF(xof: number, country: Country) {
  return Math.ceil(xof * country.rateFromXOF);
}

/** Frais Paylinko prélevés sur un encaissement (en XOF). */
export const FEE_RATE = 0.025;
export function computeFee(amount: number) {
  return Math.round(amount * FEE_RATE);
}
