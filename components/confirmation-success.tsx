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
  bookingId?: string;
  hotelName?: string;
  hotelImage?: string;
  city?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  total?: number;
  failed?: boolean;
};

export function ConfirmationSuccess(props: Props) {
  const [draft, setDraft] = useState<ReservationDraft | null>(null);

  useEffect(() => {
    setDraft(loadReservation());
  }, []);

  if (props.failed) {
    return (
      <section className="page-enter glass-card mx-auto w-full max-w-xl space-y-6 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl text-red-400">✕</div>
        <h1 className="font-display text-3xl font-light tracking-[-0.02em]">Payment unsuccessful</h1>
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">Your reservation was not confirmed. No charge was completed.</p>
        <Link href="/hotels" className="btn-primary inline-flex">Return to stays</Link>
      </section>
    );
  }

  const ref = draft?.confirmationRef || props.fallbackRef || "AX-PENDING";
  const name = draft?.hotelName || props.hotelName;
  const image = draft?.hotelImage || props.hotelImage;
  const pricing = draft?.pricing;
  const guest = draft?.guest;

  return (
    <section className="page-enter glass-card mx-auto w-full max-w-2xl space-y-8 p-8 text-center sm:p-12">
      <ReservationProgress current="confirmation" />
      <div className="confirmation-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(201,169,98,0.35)] bg-[rgba(201,169,98,0.12)] text-2xl text-[var(--luxury-gold)] shadow-[var(--shadow-xl)]">✓</div>
      <div className="space-y-3">
        <p className="eyebrow eyebrow-gold">Your stay is confirmed</p>
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
          {guest?.firstName ? `${guest.firstName}, welcome` : "Welcome"} to quiet luxury
        </h1>
        <p className="mx-auto max-w-md text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          Confirmation queued for {guest?.email || "your inbox"}. Our concierge team will coordinate every detail before arrival.
        </p>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-left">
        <p className="eyebrow">Booking reference</p>
        <p className="mt-2 font-mono text-2xl font-medium tracking-wide text-[var(--luxury-gold)]">{ref}</p>
      </div>
      {name && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] text-left">
          {image && <img src={image} alt="" className="aspect-[16/9] w-full object-cover" />}
          <div className="space-y-3 p-5 sm:p-6">
            <p className="font-display text-xl font-light">{name}</p>
            <p className="text-sm text-[var(--foreground-muted)]">{draft?.roomName || props.roomName} · {draft?.checkIn || props.checkIn} → {draft?.checkOut || props.checkOut}</p>
            {pricing && <PricingBreakdownView pricing={pricing} compact />}
            {!pricing && props.total != null && <p className="font-display text-lg font-light">{formatUsd(props.total)}</p>}
          </div>
        </div>
      )}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-5 text-left">
        <p className="eyebrow">Private concierge</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(201,169,98,0.35)] bg-[rgba(201,169,98,0.12)] text-sm font-semibold text-[var(--luxury-gold)]">AX</div>
          <div>
            <p className="text-sm font-medium">concierge@avenirlux.com</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">Available 24/7 for {draft?.city || props.city || "your destination"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/account" className="btn-primary">View booking history</Link>
        <Link href="/hotels" className="btn-secondary">Explore more stays</Link>
      </div>
    </section>
  );
}
