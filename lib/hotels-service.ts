import { getDestinationCards } from "@/lib/liteapi/destinations";
import { hasLiteApiKey } from "@/lib/liteapi/config";
import {
  getHotelFromLiteApi,
  getSimilarHotelsFromLiteApi,
  searchHotelsFromLiteApi,
  type HotelSearchQuery,
} from "@/lib/liteapi/search";
import type { Hotel } from "@/lib/hotel-types";

export type HotelsSearchResult = {
  hotels: Hotel[];
  hasMore: boolean;
  error?: string;
};

export async function fetchHotels(query: HotelSearchQuery): Promise<HotelsSearchResult> {
  if (!hasLiteApiKey()) {
    return { hotels: [], hasMore: false, error: "Hotel search is unavailable. Configure LITE_API_KEY." };
  }

  try {
    const result = await searchHotelsFromLiteApi(query);
    return { ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load hotels";
    console.error("[hotels-service]", message);
    return { hotels: [], hasMore: false, error: message };
  }
}

export async function fetchHotelById(
  id: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">
): Promise<Hotel | null> {
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

export type { HotelSearchQuery };
