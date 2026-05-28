"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { buildStayQuery, countNights, formatUsd, generateConfirmationRef } from "@/lib/booking-utils";
import type { Hotel } from "@/lib/hotel-types";

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
  const subtotal = nightly * nights;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const ref = generateConfirmationRef();
    const q = buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id });
    router.push(
      `/booking/confirmation?${q}&ref=${ref}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`
    );
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <section className="glass-card space-y-5 p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Guest details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            First name
            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-premium mt-2" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Last name
            <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-premium mt-2" />
          </label>
        </div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Email
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mt-2" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Phone
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium mt-2" />
        </label>
      </section>
      <aside className="glass-card h-fit space-y-5 p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Reservation summary</h2>
        <img src={hotel.image} alt={hotel.name} className="aspect-[16/10] w-full rounded-[var(--radius-lg)] object-cover" />
        <p className="font-display text-xl font-medium">{hotel.name}</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          {room?.name} · {checkIn} → {checkOut}
        </p>
        <p className="text-base font-semibold">Total {formatUsd(total)}</p>
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
          {submitting ? "Confirming..." : "Confirm reservation"}
        </button>
        <Link href={`/hotel/${hotel.id}?${buildStayQuery({ checkIn, checkOut, guests, roomId: room?.id })}`} className="btn-ghost block text-center text-sm">
          ← Back to hotel
        </Link>
      </aside>
    </form>
  );
}
