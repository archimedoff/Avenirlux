import { fetchHotels } from "@/lib/hotels-service";
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

/** Live inventory: marketplace listings + LiteAPI (and future Expedia) via provider aggregator. */
export async function fetchConciergeHotels(city?: string, limit = 4): Promise<ConciergeHotelPick[]> {
  if (!city?.trim()) return [];

  const { hotels } = await fetchHotels({ city: city.trim(), limit });
  if (!hotels.length) return [];

  return hotels.slice(0, limit).map(toPick);
}
