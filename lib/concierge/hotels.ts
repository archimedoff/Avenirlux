import { fetchHotels } from "@/lib/hotels-service";
import { isDatabaseConfigured } from "@/lib/db/config";
import { searchPublishedProperties } from "@/lib/properties/search";
import type { ConciergeHotelPick } from "@/lib/concierge/types";
import type { Hotel } from "@/lib/hotel-types";

function toPick(h: Hotel): ConciergeHotelPick {
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    image: h.image,
    pricePerNight: h.pricePerNight,
    rating: h.rating,
    starRating: h.starRating,
    hotelType: h.hotelType,
    categories: h.categories,
  };
}

export async function fetchConciergeHotels(city?: string, limit = 4): Promise<ConciergeHotelPick[]> {
  if (!city?.trim()) return [];

  if (isDatabaseConfigured()) {
    const published = await searchPublishedProperties({ city: city.trim(), limit });
    if (published.length) {
      return published.map(toPick);
    }
  }

  const { hotels, error } = await fetchHotels({ city: city.trim(), limit });
  if (error || !hotels.length) return [];

  return hotels.slice(0, limit).map(toPick);
}
