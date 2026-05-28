"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DestinationGrid, type DestinationCard } from "@/components/destination-grid";
import { HotelCard } from "@/components/hotel-card";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { buildStayQuery } from "@/lib/booking-utils";
import type { AvailabilityStatus, Hotel, LuxuryCategory } from "@/lib/hotel-types";

function filterHotelsClient(
  hotels: Hotel[],
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    guests?: number;
    availability?: AvailabilityStatus;
    categories?: LuxuryCategory[];
  }
): Hotel[] {
  return hotels.filter((hotel) => {
    if (filters.minPrice !== undefined && hotel.pricePerNight < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && hotel.pricePerNight > filters.maxPrice) return false;
    if (filters.minRating !== undefined && hotel.rating < filters.minRating) return false;
    if (filters.guests !== undefined) {
      const maxGuests = Math.max(...hotel.rooms.map((r) => r.maxGuests), 2);
      if (maxGuests < filters.guests) return false;
    }
    if (filters.availability && hotel.availability !== filters.availability) return false;
    if (
      filters.categories?.length &&
      !filters.categories.some((cat) => hotel.categories.includes(cat))
    )
      return false;
    return true;
  });
}

const CATEGORY_OPTIONS: { id: LuxuryCategory; label: string }[] = [
  { id: "beachfront", label: "Beachfront" },
  { id: "spa", label: "Spa" },
  { id: "villa", label: "Villa" },
  { id: "resort", label: "Resort" },
  { id: "penthouse", label: "Penthouse" },
];

type HotelsListingProps = {
  hotels: Hotel[];
  destinations: DestinationCard[];
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  limit?: number;
  hasMore?: boolean;
  error?: string;
};

export function HotelsListing({
  hotels,
  destinations,
  city,
  checkIn,
  checkOut,
  guests,
  limit = 20,
  hasMore = false,
  error,
}: HotelsListingProps) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minGuests, setMinGuests] = useState(guests || "");
  const [availability, setAvailability] = useState<"" | AvailabilityStatus>("");
  const [activeCategories, setActiveCategories] = useState<LuxuryCategory[]>([]);

  const filtered = useMemo(() => {
    return filterHotelsClient(hotels, {
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      guests: minGuests ? Number(minGuests) : undefined,
      availability: availability || undefined,
      categories: activeCategories.length ? activeCategories : undefined,
    });
  }, [hotels, minPrice, maxPrice, minRating, minGuests, availability, activeCategories]);

  const queryString = buildStayQuery({
    city,
    checkIn,
    checkOut,
    guests: Number(guests || minGuests || 2),
  });

  const toggleCategory = (cat: LuxuryCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setMinGuests("");
    setAvailability("");
    setActiveCategories([]);
  };

  return (
    <div className="space-y-8 pb-8 sm:space-y-10">
      <section className="glass-card p-6 sm:p-8">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Refine your journey
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
          {city ? `${city}, privately selected` : "AvenirLux hotels"}
        </h1>
        <p className="mt-3 text-[0.9375rem] text-[var(--foreground-muted)]">
          {filtered.length} residence{filtered.length !== 1 ? "s" : ""}
          {city ? ` in ${city}` : " across our collection"}
          {checkIn && checkOut ? ` · ${checkIn} → ${checkOut}` : ""}
        </p>
        <div className="mt-6">
          <SearchBar
            compact
            initialCity={city}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={Number(guests || 2)}
          />
        </div>
      </section>

      {!city && (
        <DestinationGrid destinations={destinations} title="Where to go" subtitle="Every destination includes live luxury availability" />
      )}

      {error && <ErrorState title="Unable to load stays" message={error} />}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="glass-card h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            Filters
          </p>

          {city && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">City</p>
              <Link href="/hotels" className="btn-ghost mt-2 w-full text-sm">
                View all cities
              </Link>
            </div>
          )}

          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Min guests
            <select value={minGuests} onChange={(e) => setMinGuests(e.target.value)} className="input-premium mt-2">
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}+ guests
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Min price
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-premium mt-2" placeholder="USD" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Max price
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-premium mt-2" placeholder="USD" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Min rating
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="input-premium mt-2">
              <option value="">Any</option>
              <option value="4.5">4.5+</option>
              <option value="4.7">4.7+</option>
              <option value="4.9">4.9+</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Availability
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as "" | AvailabilityStatus)}
              className="input-premium mt-2"
            >
              <option value="">Any</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
            </select>
          </label>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ id, label }) => {
                const active = activeCategories.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleCategory(id)}
                    className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors duration-300 ${
                      active
                        ? "border-[var(--luxury-ink)] bg-[var(--luxury-ink)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className="btn-ghost w-full text-sm" onClick={clearFilters}>
            Clear filters
          </button>
        </aside>

        {!error && hotels.length === 0 ? (
          <EmptyState
            title="No stays available"
            description={city ? `Try different dates or another neighborhood in ${city}.` : "Choose a destination to explore live availability."}
            action={{ href: "/hotels", label: "Browse destinations" }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No stays match"
            description={
              city
                ? `We could not find residences in ${city} with these filters.`
                : "Adjust filters or choose another destination."
            }
            action={{ href: "/hotels", label: "Browse all hotels" }}
          >
            <button type="button" className="btn-secondary mt-4" onClick={clearFilters}>
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-6 md:grid-cols-2">
              {filtered.map((hotel) => (
                <div key={hotel.id} className="animate-fade-up">
                  <HotelCard hotel={hotel} detailQueryString={queryString} />
                </div>
              ))}
            </section>
            {hasMore && (
              <div className="flex justify-center">
                <Link
                  href={`/hotels?${buildStayQuery({ city, checkIn, checkOut, guests: Number(guests || 2) })}&limit=${limit + 20}`}
                  className="btn-secondary"
                >
                  Load more stays
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
