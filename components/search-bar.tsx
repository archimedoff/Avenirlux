"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));

    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="glass-search grid gap-3.5 rounded-[var(--radius-card)] p-4 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4 sm:p-5 md:grid-cols-4 md:items-end md:p-6"
    >
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Where
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="City or region"
          className="input-premium !mt-2 font-medium normal-case tracking-normal placeholder:font-normal"
        />
      </label>
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Check in
        <input
          type="date"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
          className="input-premium !mt-2 font-medium normal-case tracking-normal"
        />
      </label>
      <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        Check out
        <input
          type="date"
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          className="input-premium !mt-2 font-medium normal-case tracking-normal"
        />
      </label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end md:col-span-1">
        <label className="min-w-0 flex-1 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
          Guests
          <input
            type="number"
            min={1}
            max={12}
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value || 1))}
            className="input-premium !mt-2 font-medium normal-case tracking-normal"
          />
        </label>
        <button
          type="submit"
          className="group btn-primary relative h-[46px] w-full shrink-0 overflow-hidden px-6 sm:w-auto"
        >
          <span className="relative z-[1]">Search</span>
          <span
            className="pointer-events-none absolute inset-0 translate-y-full bg-gradient-to-t from-white/0 via-white/15 to-white/0 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          />
        </button>
      </div>
    </form>
  );
}
