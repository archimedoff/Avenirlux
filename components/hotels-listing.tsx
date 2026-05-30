"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DestinationGrid, type DestinationCard } from "@/components/destination-grid";
import { HotelsFiltersPanel } from "@/components/hotels/hotels-filters-panel";
import { LuxuryHotelSearch } from "@/components/hotels/luxury-hotel-search";
import { HotelCard } from "@/components/hotel-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { buildStayQuery } from "@/lib/booking-utils";
import {
  filterHotels,
  parseAmenitiesParam,
  parseCategoriesParam,
  type HotelsFilterState,
} from "@/lib/hotels-filter";
import type { Hotel } from "@/lib/hotel-types";
import type { HotelSearchErrorCode } from "@/lib/providers/hotels/types";
import { getHotelSearchErrorTitle } from "@/lib/providers/hotels/messages";

type HotelsListingProps = {
  hotels: Hotel[];
  destinations: DestinationCard[];
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  error?: string;
  errorCode?: HotelSearchErrorCode;
  initialFilters?: HotelsFilterState;
};

export function HotelsListing({
  hotels,
  destinations,
  city,
  checkIn,
  checkOut,
  guests: guestsParam,
  rooms: roomsParam,
  limit = 24,
  offset = 0,
  hasMore = false,
  error,
  errorCode,
  initialFilters = {},
}: HotelsListingProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<HotelsFilterState>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const guests = Number(guestsParam || 2) || 2;
  const rooms = Number(roomsParam || 1) || 1;

  const filtered = useMemo(() => filterHotels(hotels, filters), [hotels, filters]);

  const queryString = buildStayQuery({
    city,
    checkIn,
    checkOut,
    guests,
    rooms,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    minStars: filters.minStars,
    amenities: filters.amenities,
    categories: filters.categories,
  });

  const applyFiltersToUrl = (next: HotelsFilterState) => {
    setFilters(next);
    const qs = buildStayQuery({
      city,
      checkIn,
      checkOut,
      guests,
      rooms,
      limit,
      minPrice: next.minPrice,
      maxPrice: next.maxPrice,
      minRating: next.minRating,
      minStars: next.minStars,
      amenities: next.amenities,
      categories: next.categories,
    });
    router.replace(`/hotels?${qs}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({});
    router.replace(`/hotels?${buildStayQuery({ city, checkIn, checkOut, guests, rooms, limit })}`, {
      scroll: false,
    });
    setMobileFiltersOpen(false);
  };

  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.minStars,
    filters.availability,
    filters.categories?.length,
    filters.amenities?.length,
  ].filter(Boolean).length;

  return (
    <div className="hotels-page pb-10 sm:pb-14">
      <header className="hotels-hero glass-card page-enter">
        <div className="hotels-hero__glow" aria-hidden />
        <p className="eyebrow eyebrow-gold">
          Worldwide collection
        </p>
        <h1 className="font-display mt-4 text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.05] tracking-[-0.04em] text-[var(--foreground)]">
          {city ? `${city}, privately selected` : "Discover luxury stays"}
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          Live rates from global partners — curated four- and five-star residences with real imagery.
        </p>
        <div className="mt-8">
          <LuxuryHotelSearch
            initialCity={city}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests}
            initialRooms={rooms}
          />
        </div>
      </header>

      {!city && !error && (
        <div className="page-enter animate-fade-up-delay-1">
          <DestinationGrid
            destinations={destinations}
            title="Signature destinations"
            subtitle="Live luxury availability from LiteAPI"
          />
        </div>
      )}

      {error && errorCode === "partial" && hotels.length > 0 ? (
        <div
          role="status"
          className="page-enter mb-6 rounded-[var(--radius-lg)] border border-[rgba(201,169,98,0.3)] bg-[rgba(201,169,98,0.08)] px-4 py-3 text-sm text-[var(--luxury-gold)]"
        >
          <p className="font-medium">{getHotelSearchErrorTitle(errorCode)}</p>
          {error ? <p className="mt-1 text-[var(--foreground-muted)]">{error}</p> : null}
        </div>
      ) : null}

      {error && (errorCode !== "partial" || hotels.length === 0) ? (
        <ErrorState title={getHotelSearchErrorTitle(errorCode)} message={error} />
      ) : null}

      {(!error || errorCode === "partial") && (
        <div className="hotels-layout">
          <div className="hotels-layout__toolbar">
            <button
              type="button"
              className="btn-secondary hotels-layout__filter-toggle lg:hidden"
              onClick={() => setMobileFiltersOpen((o) => !o)}
              aria-expanded={mobileFiltersOpen}
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
            <p className="hidden text-sm text-[var(--foreground-muted)] lg:block">
              {filtered.length} residence{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <aside className={`hotels-layout__aside ${mobileFiltersOpen ? "hotels-layout__aside--open" : ""}`}>
            <HotelsFiltersPanel filters={filters} onChange={applyFiltersToUrl} onClear={clearFilters} />
          </aside>

          <div className="hotels-layout__results">
            {!city && hotels.length === 0 ? (
              <EmptyState
                title="Choose a destination"
                description="Search a city above or pick a destination to explore live luxury availability."
                action={{ href: "#main-content", label: "Search above" }}
              />
            ) : hotels.length === 0 ? (
              <EmptyState
                title="No stays available"
                description={city ? `Try different dates for ${city}.` : "Adjust your search."}
                action={{ href: "/hotels", label: "Browse destinations" }}
              />
            ) : filtered.length === 0 ? (
              <EmptyState title="No stays match your filters" description="Relax filters to see more residences.">
                <button type="button" className="btn-secondary mt-4" onClick={clearFilters}>
                  Clear filters
                </button>
              </EmptyState>
            ) : (
              <>
                <ul className="hotels-results-grid">
                  {filtered.map((hotel, index) => (
                    <li
                      key={hotel.id}
                      className="hotels-results-grid__item"
                      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                    >
                      <HotelCard hotel={hotel} detailQueryString={queryString} />
                    </li>
                  ))}
                </ul>
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <Link
                      href={`/hotels?${buildStayQuery({
                        city,
                        checkIn,
                        checkOut,
                        guests,
                        rooms,
                        limit: limit + 24,
                        offset,
                        minPrice: filters.minPrice,
                        maxPrice: filters.maxPrice,
                        minRating: filters.minRating,
                        minStars: filters.minStars,
                        amenities: filters.amenities,
                        categories: filters.categories,
                      })}`}
                      className="btn-secondary"
                    >
                      Load more residences
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function buildInitialFiltersFromParams(params: {
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  minStars?: string;
  amenities?: string;
  category?: string;
}): HotelsFilterState {
  return {
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    minStars: params.minStars ? Number(params.minStars) : undefined,
    amenities: parseAmenitiesParam(params.amenities),
    categories: parseCategoriesParam(params.category),
  };
}
