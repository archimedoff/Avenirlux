"use client";

import { formatUsd } from "@/lib/booking-utils";
import type { PricingBreakdown } from "@/lib/reservation/pricing";

type Props = { pricing: PricingBreakdown; compact?: boolean };

export function PricingBreakdownView({ pricing, compact }: Props) {
  return (
    <div className={`space-y-2 text-sm ${compact ? "" : "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"}`}>
      <div className="flex justify-between text-[var(--foreground-muted)]">
        <span>
          {formatUsd(pricing.nightly)} × {pricing.nights} night{pricing.nights > 1 ? "s" : ""}
        </span>
        <span>{formatUsd(pricing.subtotal)}</span>
      </div>
      <div className="flex justify-between text-[var(--foreground-muted)]">
        <span>Taxes &amp; local fees</span>
        <span>{formatUsd(pricing.taxes)}</span>
      </div>
      <div className="flex justify-between text-[var(--foreground-muted)]">
        <span>Service fee</span>
        <span>{formatUsd(pricing.serviceFee)}</span>
      </div>
      <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--foreground)]">
        <span>Total</span>
        <span>{formatUsd(pricing.total)}</span>
      </div>
    </div>
  );
}
