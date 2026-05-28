"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildStayQuery, countNights, formatUsd } from "@/lib/booking-utils";
import type { Hotel } from "@/lib/hotel-types";

type HotelBookingSidebarProps = {
  hotel: Hotel;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialRoomId?: string;
};

export function HotelBookingSidebar({
  hotel,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 2,
  initialRoomId,
}: HotelBookingSidebarProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [roomId, setRoomId] = useState(initialRoomId || hotel.rooms[0]?.id || "");

  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nightly = room?.pricePerNight ?? hotel.pricePerNight;
  const nights = countNights(checkIn, checkOut);
  const total = nightly * nights;
  const serviceFee = Math.round(total * 0.08);
  const grandTotal = total + serviceFee;

  const bookingHref = useMemo(() => {
    const q = buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id });
    return `/booking?${q}`;
  }, [hotel.id, checkIn, checkOut, guests, room?.id]);

  return (
    <>
      <aside className="glass-card sticky top-20 hidden h-fit space-y-5 p-6 sm:block sm:p-8 lg:top-24">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Reserve</p>
        <p className="text-3xl font-semibold tracking-[-0.03em]">
          {formatUsd(nightly)}
          <span className="text-lg font-medium text-[var(--foreground-muted)]"> / night</span>
        </p>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[0.6875rem] font-semibold ${
            hotel.availability === "available"
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-950 ring-1 ring-amber-200"
          }`}
        >
          {hotel.availability === "available" ? "Available" : "Limited availability"}
        </span>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Room
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="input-premium mt-2">
            {hotel.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {formatUsd(r.pricePerNight)}/night
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Check-in
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-premium mt-2" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Check-out
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-premium mt-2" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Guests
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-premium mt-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div className="flex justify-between text-[var(--foreground-muted)]">
            <span>
              {formatUsd(nightly)} × {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span>{formatUsd(total)}</span>
          </div>
          <div className="flex justify-between text-[var(--foreground-muted)]">
            <span>Service fee</span>
            <span>{formatUsd(serviceFee)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
            <span>Total</span>
            <span>{formatUsd(grandTotal)}</span>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">{hotel.cancellationPolicy}</p>
        <Link href={bookingHref} className="btn-primary block w-full py-3.5 text-center">
          Continue to booking
        </Link>
      </aside>
      <div className="fixed inset-x-3 bottom-3 z-40 rounded-[var(--radius-lg)] border border-white/60 bg-white/90 p-3 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{formatUsd(grandTotal)}</p>
          <Link href={bookingHref} className="btn-primary !px-4 !py-2.5 text-xs">
            Reserve
          </Link>
        </div>
      </div>
    </>
  );
}
