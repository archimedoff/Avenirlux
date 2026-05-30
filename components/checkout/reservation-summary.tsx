"use client";

import { PricingBreakdownView } from "@/components/pricing-breakdown";
import { formatUsd } from "@/lib/booking-utils";
import type { Hotel } from "@/lib/hotel-types";
import type { PricingBreakdown } from "@/lib/reservation/pricing";

type Props = {
  hotel: Hotel;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricing: PricingBreakdown;
};

export function ReservationSummary({ hotel, roomName, checkIn, checkOut, guests, pricing }: Props) {
  return (
    <aside className="glass-card sticky top-20 h-fit space-y-5 p-6 sm:p-8 lg:top-24">
      <p className="eyebrow eyebrow-gold">Reservation summary</p>
      <img src={hotel.image} alt={hotel.name} className="aspect-[16/10] w-full rounded-[var(--radius-lg)] object-cover" />
      <div>
        <p className="font-display text-xl font-light tracking-[-0.02em]">{hotel.name}</p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          {roomName} · {checkIn} → {checkOut}
        </p>
        <p className="text-sm text-[var(--foreground-muted)]">{guests} guest{guests > 1 ? "s" : ""}</p>
      </div>
      <PricingBreakdownView pricing={pricing} />
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">{hotel.cancellationPolicy}</p>
      </div>
      <p className="text-center font-display text-2xl font-light tracking-[-0.02em] text-[var(--foreground)]">
        {formatUsd(pricing.total)}
      </p>
    </aside>
  );
}
