"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PricingBreakdownView } from "@/components/pricing-breakdown";
import { buildStayQuery, countNights, defaultCheckIn, defaultCheckOut, formatUsd } from "@/lib/booking-utils";
import type { Hotel } from "@/lib/hotel-types";
import { calculateStayPricing } from "@/lib/reservation/pricing";
import { buildDraftFromStay, saveReservation } from "@/lib/reservation/store";

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
  const [checkIn, setCheckIn] = useState(initialCheckIn || defaultCheckIn());
  const [checkOut, setCheckOut] = useState(initialCheckOut || defaultCheckOut());
  const [guests, setGuests] = useState(initialGuests);
  const [roomId, setRoomId] = useState(initialRoomId || hotel.rooms[0]?.id || "");

  const minCheckOut = useMemo(() => {
    if (!checkIn) return "";
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [checkIn]);

  const room = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];
  const nightly = room?.pricePerNight ?? hotel.pricePerNight;
  const nights = countNights(checkIn, checkOut);
  const pricing = calculateStayPricing(nightly, nights);

  useEffect(() => {
    if (!checkIn || !checkOut || !room) return;
    saveReservation(
      buildDraftFromStay({
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelImage: hotel.image,
        city: hotel.city,
        country: hotel.country,
        checkIn,
        checkOut,
        guests,
        roomId: room.id,
        roomName: room.name,
        pricing,
      })
    );
  }, [hotel.id, hotel.name, hotel.image, hotel.city, hotel.country, checkIn, checkOut, guests, room?.id, room?.name, nightly, nights]);

  const reserveHref = useMemo(() => {
    const q = buildStayQuery({ hotelId: hotel.id, city: hotel.city, checkIn, checkOut, guests, roomId: room?.id });
    return `/reserve?${q}`;
  }, [hotel.id, hotel.city, checkIn, checkOut, guests, room?.id]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <aside className="glass-card sticky top-20 hidden h-fit space-y-5 p-6 sm:block sm:p-8 lg:top-24">
        <p className="eyebrow eyebrow-gold">Reserve</p>
        <p className="font-display text-3xl font-light tracking-[-0.03em]">
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
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-premium mt-2" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
          Check-out
          <input type="date" min={minCheckOut || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-premium mt-2" />
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
        <PricingBreakdownView pricing={pricing} />
        <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">{hotel.cancellationPolicy}</p>
        <Link href={reserveHref} className="btn-primary block w-full py-3.5 text-center">
          Reserve your stay
        </Link>
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/92 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">{room?.name}</p>
            <p className="text-lg font-semibold tracking-[-0.02em]">{formatUsd(pricing.total)}</p>
            <p className="text-[0.6875rem] text-[var(--foreground-muted)]">{nights} night{nights > 1 ? "s" : ""} · {guests} guests</p>
          </div>
          <Link href={reserveHref} className="btn-primary shrink-0 !px-5 !py-3 text-sm">
            Reserve
          </Link>
        </div>
      </div>
    </>
  );
}
