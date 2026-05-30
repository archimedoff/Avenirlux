"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { buildStayQuery, defaultCheckIn, defaultCheckOut } from "@/lib/booking-utils";
import { DESTINATIONS } from "@/lib/liteapi/destinations";

type SearchBarProps = {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  compact?: boolean;
};

const guestOptions = [1, 2, 3, 4, 5, 6];

export function SearchBar({
  initialCity = "",
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn || defaultCheckIn());
  const [checkOut, setCheckOut] = useState(initialCheckOut || defaultCheckOut());
  const [guests, setGuests] = useState(initialGuests);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minCheckOut = useMemo(() => {
    if (!checkIn) return today;
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [checkIn, today]);

  useEffect(() => {
    setCity(initialCity);
    if (initialCheckIn) setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
    setGuests(initialGuests);
  }, [initialCity, initialCheckIn, initialCheckOut, initialGuests]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/hotels?${buildStayQuery({ city, checkIn, checkOut, guests })}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`glass-search grid gap-4 rounded-[var(--radius-card)] p-5 transition-[transform,box-shadow] duration-500 sm:p-6 ${
        compact ? "md:grid-cols-5 md:items-end" : "md:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] md:items-end"
      }`}
    >
      <label className="flex flex-col gap-2">
        <span className="eyebrow">Where</span>
        <input
          type="text"
          list="avenirlux-cities"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or region"
          className="input-premium !mt-0 font-medium normal-case tracking-normal"
        />
        <datalist id="avenirlux-cities">
          {DESTINATIONS.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-2">
        <span className="eyebrow">Check in</span>
        <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-premium !mt-0" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="eyebrow">Check out</span>
        <input type="date" min={minCheckOut} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-premium !mt-0" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="eyebrow">Guests</span>
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-premium !mt-0">
          {guestOptions.map((n) => (
            <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary h-[48px] w-full md:self-end">Search stays</button>
    </form>
  );
}
