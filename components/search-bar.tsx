"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
      className={`glass-search grid gap-3.5 rounded-[var(--radius-card)] p-4 transition-[transform,box-shadow] duration-500 sm:gap-4 ${
        compact ? "md:grid-cols-5 md:items-end" : "sm:p-5 md:grid-cols-4 md:items-end md:p-6"
      }`}
    >
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Where
        <input
          type="text"
          list="avenirlux-cities"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or region"
          className="input-premium !mt-2 font-medium normal-case tracking-normal"
        />
        <datalist id="avenirlux-cities">
          {DESTINATIONS.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
      </label>
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Check in
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-premium !mt-2" />
      </label>
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Check out
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-premium !mt-2" />
      </label>
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Guests
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-premium !mt-2">
          {guestOptions.map((n) => (
            <option key={n} value={n}>
              {n} guest{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary h-[46px] w-full">
        Search stays
      </button>
    </form>
  );
}
