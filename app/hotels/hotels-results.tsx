"use client";

import { useEffect, useMemo, useState } from "react";

import { HotelCard } from "@/components/hotel-card";
import type { Hotel } from "@/lib/hotel-types";

type HotelsResultsProps = {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

export function HotelsResults({ city, checkIn, checkOut, guests }: HotelsResultsProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (city?.trim()) params.set("city", city.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    return params.toString();
  }, [city, checkIn, checkOut, guests]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/hotels?${queryString}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to fetch hotels right now.");
        }

        if (isMounted) {
          setHotels(Array.isArray(payload.hotels) ? payload.hotels : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setHotels([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [queryString]);

  return (
    <>
      <section className="glass-card p-8 sm:p-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Hotel listings
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-[2.25rem]">
          {city ? `Stays in ${city}` : "Discover your stay"}
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          {loading ? "Finding the best matches for you…" : `${hotels.length} curated properties available`}
        </p>
      </section>

      {loading ? (
        <section className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-card skeleton-shimmer">
              <div className="skeleton-card__media" />
              <div className="skeleton-card__body">
                <div className="skeleton-card__line skeleton-card__line--med" />
                <div className="skeleton-card__line skeleton-card__line--short" />
                <div className="skeleton-card__line w-full" />
                <div className="skeleton-card__line mt-2 w-[55%]" />
              </div>
            </div>
          ))}
        </section>
      ) : error ? (
        <section className="rounded-[var(--radius-card)] border border-red-200/80 bg-red-50/80 p-10 text-center shadow-[var(--shadow-sm)]">
          <p className="text-lg font-semibold tracking-[-0.02em] text-red-950">We couldn&apos;t load hotels</p>
          <p className="mt-2 text-sm leading-relaxed text-red-800/90">{error}</p>
        </section>
      ) : hotels.length === 0 ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-sm)]">
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">No stays match your search</p>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">Try another city or adjust your dates.</p>
        </section>
      ) : (
        <section className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} detailQueryString={queryString} />
          ))}
        </section>
      )}
    </>
  );
}
