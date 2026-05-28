import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury hotels",
  description: "Browse curated luxury residences with live availability across the world's most considered destinations.",
};

import { HotelsListing } from "@/components/hotels-listing";
import { fetchHotels, getDestinations } from "@/lib/hotels-data";

type HotelsPageProps = {
  searchParams: Promise<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    limit?: string;
  }>;
};

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;
  const limit = Number(params.limit || "20") || 20;

  const { hotels, hasMore, error } = await fetchHotels({
    city: params.city,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: Number(params.guests || "2") || 2,
    limit,
  });

  return (
    <HotelsListing
      hotels={hotels}
      destinations={getDestinations()}
      city={params.city}
      checkIn={params.checkIn}
      checkOut={params.checkOut}
      guests={params.guests}
      limit={limit}
      hasMore={hasMore}
      error={error}
    />
  );
}
