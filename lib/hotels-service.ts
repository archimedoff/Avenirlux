import { getDestinationCards } from "@/lib/liteapi/destinations";
import { hasLiteApiKey } from "@/lib/liteapi/config";
import {
  getHotelFromLiteApi,
  getSimilarHotelsFromLiteApi,
  searchHotelsFromLiteApi,
  type HotelSearchQuery as LiteHotelSearchQuery,
} from "@/lib/liteapi/search";
import type { Hotel } from "@/lib/hotel-types";
import { isAvenirPropertyId } from "@/lib/properties/ids";
import {
  getPublishedPropertyById,
  getSimilarPublishedProperties,
  searchPublishedProperties,
} from "@/lib/properties/search";

export type HotelSearchQuery = LiteHotelSearchQuery & {
  propertyType?: string;
  amenities?: string[];
};

export type HotelsSearchResult = {
  hotels: Hotel[];
  hasMore: boolean;
  error?: string;
};

function dedupeHotels(hotels: Hotel[]): Hotel[] {
  const seen = new Set<string>();
  return hotels.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
}

export async function fetchHotels(query: HotelSearchQuery): Promise<HotelsSearchResult> {
  const marketplace = await searchPublishedProperties({
    city: query.city,
    propertyType: query.propertyType,
    guests: query.guests,
    amenities: query.amenities,
    limit: query.limit ?? 24,
    offset: query.offset ?? 0,
  });

  if (!hasLiteApiKey()) {
    if (marketplace.length) {
      return { hotels: marketplace, hasMore: marketplace.length >= (query.limit ?? 24) };
    }
    return {
      hotels: [],
      hasMore: false,
      error: marketplace.length ? undefined : "Hotel search is unavailable. Configure LITE_API_KEY or add published listings.",
    };
  }

  try {
    const result = await searchHotelsFromLiteApi(query);
    const merged = dedupeHotels([...marketplace, ...result.hotels]);
    return { hotels: merged, hasMore: result.hasMore };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load hotels";
    console.error("[hotels-service]", message);
    if (marketplace.length) {
      return { hotels: marketplace, hasMore: false };
    }
    return { hotels: [], hasMore: false, error: message };
  }
}

export async function fetchHotelById(
  id: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">
): Promise<Hotel | null> {
  if (isAvenirPropertyId(id)) {
    return getPublishedPropertyById(id);
  }

  const marketplace = await getPublishedPropertyById(id);
  if (marketplace) return marketplace;

  if (!hasLiteApiKey()) return null;
  try {
    return await getHotelFromLiteApi(id, query);
  } catch (error) {
    console.error("[hotels-service] detail", error);
    return null;
  }
}

export async function fetchSimilarHotels(
  id: string,
  city: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">
): Promise<Hotel[]> {
  if (isAvenirPropertyId(id)) {
    return getSimilarPublishedProperties(id, city, 6);
  }

  if (!hasLiteApiKey()) return [];
  try {
    return await getSimilarHotelsFromLiteApi(id, city, query);
  } catch {
    return [];
  }
}

export function getDestinations() {
  return getDestinationCards();
}
