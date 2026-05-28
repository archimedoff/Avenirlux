"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PricingBreakdownView } from "@/components/pricing-breakdown";
import { ReservationProgress } from "@/components/reservation-progress";
import { buildStayQuery, countNights, formatUsd, generateConfirmationRef } from "@/lib/booking-utils";
import { COUNTRIES } from "@/lib/countries";
import type { Hotel } from "@/lib/hotel-types";
import { paymentGateway } from "@/lib/reservation/payment";
import { calculateStayPricing } from "@/lib/reservation/pricing";
import {
  buildDraftFromStay,
  loadReservation,
  mergeGuestDetails,
  saveReservation,
} from "@/lib/reservation/store";
import type { GuestDetails } from "@/lib/reservation/types";

const ARRIVAL_TIMES = [
  "Flexible",
  "Before 14:00",
  "14:00 – 16:00",
  "16:00 – 18:00",
  "After 18:00",
  "Late night",
];

type BookingCheckoutProps = {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId?: string;
};

export function BookingCheckout({ hotel, checkIn, checkOut, guests, roomId }: BookingCheckoutProps) {
  const router = useRouter();
  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nightly = room?.pricePerNight ?? hotel.pricePerNight;
  const nights = countNights(checkIn, checkOut);
  const pricing = calculateStayPricing(nightly, nights);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States");
  const [specialRequests, setSpecialRequests] = useState("");
  const [arrivalTime, setArrivalTime] = useState("Flexible");
  const [conciergeNotes, setConciergeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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
      pricing,
    });
    const stored = loadReservation();
    if (stored?.hotelId === hotel.id) {
      saveReservation({ ...draft, ...stored, pricing, status: "checkout" });
      if (stored.guest) {
        setFirstName(stored.guest.firstName);
        setLastName(stored.guest.lastName);
        setEmail(stored.guest.email);
        setPhone(stored.guest.phone);
        setCountry(stored.guest.country);
        setSpecialRequests(stored.guest.specialRequests || "");
        setArrivalTime(stored.guest.arrivalTime || "Flexible");
        setConciergeNotes(stored.guest.conciergeNotes || "");
      }
    } else {
      saveReservation({ ...draft, status: "checkout" });
    }
    setHydrated(true);
  }, [hotel.id, hotel.name, hotel.image, hotel.city, hotel.country, checkIn, checkOut, guests, room?.id, room?.name, nightly, nights]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    const guest: GuestDetails = {
      firstName,
      lastName,
      email,
      phone,
      country,
      specialRequests: specialRequests || undefined,
      arrivalTime,
      conciergeNotes: conciergeNotes || undefined,
    };

    const ref = generateConfirmationRef();
    const draft = mergeGuestDetails(guest);
    const reservation = draft || {
      ...buildDraftFromStay({
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
        pricing,
      }),
      guest,
      confirmationRef: ref,
      status: "confirmed" as const,
      updatedAt: new Date().toISOString(),
    };

    const confirmed = {
      ...reservation,
      guest,
      confirmationRef: ref,
      status: "confirmed" as const,
      updatedAt: new Date().toISOString(),
    };

    try {
      await paymentGateway.createIntent({
        reservation: confirmed,
        amountCents: pricing.total * 100,
        currency: "USD",
      });
    } catch {
      /* mock gateway — proceed */
    }

    saveReservation(confirmed);
    const q = buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id });
    router.push(`/confirmation?${q}&ref=${ref}`);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-sm text-[var(--foreground-muted)]">Loading checkout…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="page-enter grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <section className="glass-card space-y-6 p-6 sm:p-8">
        <ReservationProgress current="checkout" />
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Guest information</h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">Your details are stored securely for this session.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            First name
            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-premium mt-2" autoComplete="given-name" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Last name
            <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-premium mt-2" autoComplete="family-name" />
          </label>
        </div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Email
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mt-2" autoComplete="email" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Phone
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium mt-2" autoComplete="tel" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Country / region
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-premium mt-2">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Estimated arrival
          <select value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="input-premium mt-2">
            {ARRIVAL_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Special requests
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            placeholder="Dietary preferences, bedding, celebrations…"
            className="input-premium mt-2 resize-none"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Concierge requests
          <textarea
            value={conciergeNotes}
            onChange={(e) => setConciergeNotes(e.target.value)}
            rows={3}
            placeholder="Transfers, reservations, private experiences…"
            className="input-premium mt-2 resize-none"
          />
        </label>
      </section>
      <aside className="glass-card sticky top-20 h-fit space-y-5 p-6 sm:p-8 lg:top-24">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Reservation summary</h2>
        <img src={hotel.image} alt={hotel.name} className="aspect-[16/10] w-full rounded-[var(--radius-lg)] object-cover" />
        <p className="font-display text-xl font-medium">{hotel.name}</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          {room?.name} · {checkIn} → {checkOut} · {guests} guest{guests > 1 ? "s" : ""}
        </p>
        <PricingBreakdownView pricing={pricing} />
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 transition-opacity disabled:opacity-60">
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Confirming…
            </span>
          ) : (
            `Confirm · ${formatUsd(pricing.total)}`
          )}
        </button>
        <Link href={`/reserve?${buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id })}`} className="btn-ghost block text-center text-sm">
          ← Back to review
        </Link>
      </aside>
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--luxury-ink)]/20 backdrop-blur-sm">
          <div className="glass-card px-8 py-6 text-center">
            <p className="text-sm font-medium">Securing your reservation…</p>
          </div>
        </div>
      )}
    </form>
  );
}
