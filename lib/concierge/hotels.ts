import { fetchHotels } from "@/lib/hotels-service";
import { hasLiteApiKey } from "@/lib/liteapi/config";
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

/** Live inventory: LiteAPI first when configured, then marketplace host listings. */
export async function fetchConciergeHotels(city?: string, limit = 4): Promise<ConciergeHotelPick[]> {
  if (!city?.trim()) return [];

  const { hotels } = await fetchHotels({ city: city.trim(), limit: limit * 2 });
  if (!hotels.length) return [];

  const ordered = hasLiteApiKey()
    ? [
        ...hotels.filter((h) => h.providerId === "liteapi"),
        ...hotels.filter((h) => h.providerId !== "liteapi"),
      ]
    : hotels;

  return ordered.slice(0, limit).map(toPick);
}
