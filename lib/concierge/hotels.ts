import { fetchHotels } from "@/lib/hotels-service";
import type { ConciergeHotelPick } from "@/lib/concierge/types";

export async function fetchConciergeHotels(city?: string, limit = 4): Promise<ConciergeHotelPick[]> {
  if (!city?.trim()) return [];

  const { hotels, error } = await fetchHotels({ city: city.trim(), limit });
  if (error || !hotels.length) return [];

  return hotels.map((h) => ({
    id: h.id,
    name: h.name,
    city: h.city,
    image: h.image,
    pricePerNight: h.pricePerNight,
    rating: h.rating,
    starRating: h.starRating,
    hotelType: h.hotelType,
    categories: h.categories,
  }));
}
