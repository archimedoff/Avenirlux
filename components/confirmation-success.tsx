"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PricingBreakdownView } from "@/components/pricing-breakdown";
import { ReservationProgress } from "@/components/reservation-progress";
import { formatUsd } from "@/lib/booking-utils";
import { loadReservation } from "@/lib/reservation/store";
import type { ReservationDraft } from "@/lib/reservation/types";

type Props = {
  fallbackRef?: string;
  hotelName?: string;
  hotelImage?: string;
  city?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  total?: number;
};

export function ConfirmationSuccess(props: Props) {
  const [draft, setDraft] = useState<ReservationDraft | null>(null);

  useEffect(() => {
    setDraft(loadReservation());
  }, []);

  const ref = draft?.confirmationRef || props.fallbackRef || "AX-PENDING";
  const name = draft?.hotelName || props.hotelName;
  const image = draft?.hotelImage || props.hotelImage;
  const pricing = draft?.pricing;
  const guest = draft?.guest;

  return (
    <section className="page-enter glass-card mx-auto w-full max-w-2xl space-y-8 p-8 text-center sm:p-12">
      <ReservationProgress current="confirmation" />
      <div className="confirmation-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-2xl font-medium text-white shadow-[var(--shadow-xl)]">
        ✓
      </div>
      <div className="space-y-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Your stay is confirmed
        </p>
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
          {guest?.firstName ? `${guest.firstName}, welcome` : "Welcome"} to quiet luxury
        </h1>
        <p className="mx-auto max-w-md text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          A confirmation has been prepared for {guest?.email || "your inbox"}. Our concierge team will coordinate every detail before arrival.
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Booking reference</p>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-wide text-[var(--luxury-ink)]">{ref}</p>
      </div>

      {name && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] text-left">
          {image && <img src={image} alt="" className="aspect-[16/9] w-full object-cover" />}
          <div className="space-y-3 p-5 sm:p-6">
            <p className="font-display text-xl font-medium">{name}</p>
            <p className="text-sm text-[var(--foreground-muted)]">
              {draft?.roomName || props.roomName} · {draft?.checkIn || props.checkIn} → {draft?.checkOut || props.checkOut}
            </p>
            {(draft?.guests || props.guests) && (
              <p className="text-sm text-[var(--foreground-muted)]">{draft?.guests || props.guests} guests</p>
            )}
            {pricing && <PricingBreakdownView pricing={pricing} compact />}
            {!pricing && props.total != null && (
              <p className="font-semibold">Total {formatUsd(props.total)}</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Private concierge</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-sm font-semibold text-white">AX</div>
          <div>
            <p className="text-sm font-semibold">concierge@avenirlux.com</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">+1 (888) 284-6378 · Available 24/7 for {draft?.city || props.city || "your destination"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/hotels" className="btn-primary">
          Explore more stays
        </Link>
        {draft?.hotelId && (
          <Link href={`/hotel/${draft.hotelId}`} className="btn-secondary">
            View residence
          </Link>
        )}
      </div>
    </section>
  );
}
