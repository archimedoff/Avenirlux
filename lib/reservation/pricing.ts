export type PricingBreakdown = {
  nightly: number;
  nights: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
};

const TAX_RATE = 0.12;
const SERVICE_FEE_RATE = 0.08;

export function calculateStayPricing(nightly: number, nights: number): PricingBreakdown {
  const safeNights = Math.max(1, nights);
  const subtotal = nightly * safeNights;
  const taxes = Math.round(subtotal * TAX_RATE);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + taxes + serviceFee;
  return { nightly, nights: safeNights, subtotal, taxes, serviceFee, total };
}
