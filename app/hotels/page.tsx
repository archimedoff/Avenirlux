import type { Metadata } from "next";

import { HotelsListing, buildInitialFiltersFromParams } from "@/components/hotels-listing";
import { fetchHotels, getDestinations } from "@/lib/hotels-data";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type HotelsPageProps = {
  searchParams: Promise<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
    limit?: string;
    offset?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    minStars?: string;
    amenities?: string;
    category?: string;
  }>;
};

export async function generateMetadata({ searchParams }: HotelsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = params.city?.trim();
  const title = city ? `Luxury hotels in ${city}` : "Luxury hotel search";
  const description = city
    ? `Browse curated four- and five-star hotels in ${city} with live LiteAPI rates, real photos, and instant availability.`
    : "Search luxury hotels worldwide with live rates, premium filters, and hand-selected four- and five-star residences.";

  return {
    title,
    description,
    alternates: {
      canonical: `${getSiteUrl()}/hotels${city ? `?city=${encodeURIComponent(city)}` : ""}`,
    },
    openGraph: {
      title: `${title} · AvenirLux`,
      description,
      type: "website",
      url: `${getSiteUrl()}/hotels`,
    },
  };
}

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;
  const limit = Number(params.limit || "24") || 24;
  const offset = Number(params.offset || "0") || 0;

  const { hotels, hasMore, error, errorCode } = await fetchHotels({
    city: params.city,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: Number(params.guests || "2") || 2,
    rooms: Number(params.rooms || "1") || 1,
    limit,
    offset,
  });

  return (
    <HotelsListing
      hotels={hotels}
      destinations={getDestinations()}
      city={params.city}
      checkIn={params.checkIn}
      checkOut={params.checkOut}
      guests={params.guests}
      rooms={params.rooms}
      limit={limit}
      offset={offset}
      hasMore={hasMore}
      error={error}
      errorCode={errorCode}
      initialFilters={buildInitialFiltersFromParams(params)}
    />
  );
}
