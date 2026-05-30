import "server-only";

import { createHash } from "crypto";
import type { HotelSearchQuery, HotelsSearchResult } from "@/lib/providers/hotels/types";

const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 200;

type Entry = { expires: number; value: HotelsSearchResult };

const store = new Map<string, Entry>();

function cacheKey(query: HotelSearchQuery): string {
  const normalized = {
    city: query.city?.trim().toLowerCase() || "",
    checkIn: query.checkIn || "",
    checkOut: query.checkOut || "",
    guests: query.guests ?? 2,
    rooms: query.rooms ?? 1,
    offset: query.offset ?? 0,
    limit: query.limit ?? 24,
    propertyType: query.propertyType || "",
    amenities: (query.amenities || []).slice().sort().join(","),
  };
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export function getCachedSearch(query: HotelSearchQuery): HotelsSearchResult | null {
  const key = cacheKey(query);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return { ...entry.value, cached: true };
}

export function setCachedSearch(query: HotelSearchQuery, result: HotelsSearchResult): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(cacheKey(query), {
    expires: Date.now() + TTL_MS,
    value: { ...result, cached: false },
  });
}

export function clearHotelSearchCache(): void {
  store.clear();
}
