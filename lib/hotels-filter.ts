import type { AvailabilityStatus, Hotel, LuxuryCategory } from "@/lib/hotel-types";

export const LUXURY_AMENITY_OPTIONS = [
  "Spa",
  "Pool",
  "WiFi",
  "Gym",
  "Restaurant",
  "Parking",
  "Concierge",
  "Room service",
] as const;

export type HotelsFilterState = {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minStars?: number;
  guests?: number;
  rooms?: number;
  availability?: AvailabilityStatus;
  categories?: LuxuryCategory[];
  amenities?: string[];
};

export function filterHotels(hotels: Hotel[], filters: HotelsFilterState): Hotel[] {
  return hotels.filter((hotel) => {
    if (filters.minPrice !== undefined && hotel.pricePerNight < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && hotel.pricePerNight > filters.maxPrice) return false;
    if (filters.minRating !== undefined && hotel.rating < filters.minRating) return false;
    if (filters.minStars !== undefined && (hotel.starRating ?? 0) < filters.minStars) return false;
    if (filters.guests !== undefined) {
      const maxGuests = Math.max(...hotel.rooms.map((r) => r.maxGuests), 2);
      if (maxGuests < filters.guests) return false;
    }
    if (filters.availability && hotel.availability !== filters.availability) return false;
    if (
      filters.categories?.length &&
      !filters.categories.some((cat) => hotel.categories.includes(cat))
    ) {
      return false;
    }
    if (filters.amenities?.length) {
      const hay = hotel.amenities.join(" ").toLowerCase();
      if (!filters.amenities.every((a) => hay.includes(a.toLowerCase()))) return false;
    }
    return true;
  });
}

export function parseAmenitiesParam(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function parseCategoriesParam(raw?: string): LuxuryCategory[] {
  if (!raw?.trim()) return [];
  const allowed: LuxuryCategory[] = ["beachfront", "spa", "villa", "resort", "penthouse"];
  return raw.split(",").filter((c): c is LuxuryCategory => allowed.includes(c as LuxuryCategory));
}
