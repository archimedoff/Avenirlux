"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PricingBreakdownView } from "@/components/pricing-breakdown";
import { ReservationProgress } from "@/components/reservation-progress";
import { buildStayQuery, countNights, formatUsd } from "@/lib/booking-utils";
import type { Hotel } from "@/lib/hotel-types";
import { calculateStayPricing } from "@/lib/reservation/pricing";
import { buildDraftFromStay, loadReservation, saveReservation } from "@/lib/reservation/store";

type Props = {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId?: string;
};

export function ReserveReview({ hotel, checkIn, checkOut, guests, roomId }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nightly = room?.pricePerNight ?? hotel.pricePerNight;
  const nights = countNights(checkIn, checkOut);
  const pricing = calculateStayPricing(nightly, nights);

  useEffect(() => {
    const draft = buildDraftFromStay({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.image,
      city: hotel.city,
      country: hotel.country,
      checkIn,
      checkOut,
      guests,
      roomId: room?.id || "",
      roomName: room?.name || "Suite",
      pricing: calculateStayPricing(nightly, nights),
    });
    saveReservation(draft);
    setReady(true);
  }, [hotel.id, hotel.name, hotel.image, hotel.city, hotel.country, checkIn, checkOut, guests, room?.id, room?.name, nightly, nights]);

  const continueCheckout = () => {
    const stored = loadReservation();
    if (stored) saveReservation({ ...stored, status: "checkout" });
    const q = buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id });
    router.push(`/checkout?${q}`);
  };

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-sm text-[var(--foreground-muted)]">Preparing your reservation…</p>
      </div>
    );
  }

  return (
    <div className="page-enter grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <section className="glass-card space-y-6 p-6 sm:p-8">
        <ReservationProgress current="reserve" />
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Review stay</p>
          <h2 className="font-display mt-2 text-2xl font-medium tracking-[-0.03em]">Your selected residence</h2>
        </div>
        <img src={hotel.image} alt={hotel.name} className="aspect-[16/10] w-full rounded-[var(--radius-lg)] object-cover" />
        <div>
          <p className="font-display text-xl font-medium">{hotel.name}</p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{hotel.location}, {hotel.city}</p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Check-in</dt>
            <dd className="mt-1 font-medium">{checkIn}</dd>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Check-out</dt>
            <dd className="mt-1 font-medium">{checkOut}</dd>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Guests</dt>
            <dd className="mt-1 font-medium">{guests}</dd>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Room</dt>
            <dd className="mt-1 font-medium">{room?.name}</dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">{hotel.cancellationPolicy}</p>
      </section>
      <aside className="glass-card h-fit space-y-5 p-6 sm:p-8">
        <h3 className="text-lg font-semibold tracking-[-0.02em]">Price summary</h3>
        <PricingBreakdownView pricing={pricing} />
        <button type="button" onClick={continueCheckout} className="btn-primary w-full py-3.5">
          Continue to checkout
        </button>
        <Link
          href={`/hotel/${hotel.id}?${buildStayQuery({ checkIn, checkOut, guests, roomId: room?.id })}`}
          className="btn-ghost block text-center text-sm"
        >
          ← Edit stay details
        </Link>
        <p className="text-center text-xs text-[var(--foreground-muted)]">
          Total due at property preview · {formatUsd(pricing.total)}
        </p>
      </aside>
    </div>
  );
}
