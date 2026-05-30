import type { ConciergeUpsell } from "@/lib/reservation/upsells";

export type PricingLineItem = {
  id: string;
  label: string;
  amount: number;
};

export type PricingBreakdown = {
  nightly: number;
  nights: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  upsells: PricingLineItem[];
  upsellTotal: number;
  total: number;
};

const TAX_RATE = 0.12;
const SERVICE_FEE_RATE = 0.08;

export function calculateStayPricing(
  nightly: number,
  nights: number,
  selectedUpsells: ConciergeUpsell[] = [],
): PricingBreakdown {
  const safeNights = Math.max(1, nights);
  const subtotal = nightly * safeNights;
  const taxes = Math.round(subtotal * TAX_RATE);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const upsells: PricingLineItem[] = selectedUpsells.map((u) => ({
    id: u.id,
    label: u.label,
    amount: u.price,
  }));
  const upsellTotal = upsells.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + taxes + serviceFee + upsellTotal;
  return { nightly, nights: safeNights, subtotal, taxes, serviceFee, upsells, upsellTotal, total };
}

export function pricingToCents(total: number): number {
  return Math.round(total * 100);
}
