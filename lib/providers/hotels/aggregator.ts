import "server-only";

import { getDestinationCards } from "@/lib/liteapi/destinations";
import type { Hotel } from "@/lib/hotel-types";
import { isAvenirPropertyId } from "@/lib/properties/ids";
import { getCachedSearch, setCachedSearch } from "@/lib/providers/hotels/cache";
import { expediaProvider } from "@/lib/providers/hotels/expedia-provider";
import { liteApiProvider } from "@/lib/providers/hotels/liteapi-provider";
import { marketplaceProvider } from "@/lib/providers/hotels/marketplace-provider";
import type {
  HotelSearchQuery,
  HotelsSearchResult,
  ProviderId,
} from "@/lib/providers/hotels/types";

const externalProviders = [liteApiProvider, expediaProvider];

function dedupeHotels(hotels: Hotel[]): Hotel[] {
  const seen = new Set<string>();
  return hotels.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
}

export async function searchHotelsAggregated(query: HotelSearchQuery): Promise<HotelsSearchResult> {
  const cached = getCachedSearch(query);
  if (cached) return cached;

  const marketplaceResult = await marketplaceProvider.search(query);
  let merged = [...marketplaceResult.hotels];
  const sources: Partial<Record<ProviderId, boolean>> = {
    marketplace: marketplaceResult.hotels.length > 0,
  };
  let error = marketplaceResult.error;
  let errorCode = marketplaceResult.errorCode;
  let hasMore = marketplaceResult.hasMore;

  const configuredExternal = externalProviders.filter((p) => p.isConfigured());

  if (!configuredExternal.length) {
    const result: HotelsSearchResult =
      merged.length > 0
        ? { hotels: merged, hasMore, sources }
        : {
            hotels: [],
            hasMore: false,
            error: "Configure LITEAPI_KEY for live hotel inventory, or publish listings on AvenirLux.",
            errorCode: "unconfigured",
            sources,
            meta: { readyForBooking: false, readyForPayments: false, multiProvider: true },
          };
    setCachedSearch(query, result);
    return result;
  }

  const externalResults = await Promise.all(
    configuredExternal.map(async (provider) => ({
      providerId: provider.id,
      result: await provider.search(query),
    })),
  );

  for (const { providerId, result: ext } of externalResults) {
    sources[providerId] = ext.hotels.length > 0 || Boolean(ext.error);
    merged = dedupeHotels([...merged, ...ext.hotels]);
    if (ext.hasMore) hasMore = true;
    if (ext.error && merged.length === 0) {
      error = ext.error;
      errorCode = ext.errorCode;
    } else if (ext.error && merged.length > 0) {
      error = ext.error;
      errorCode = "partial";
    }
  }

  const result: HotelsSearchResult = {
    hotels: merged,
    hasMore,
    error: merged.length ? (errorCode === "partial" ? error : undefined) : error,
    errorCode: merged.length ? errorCode : errorCode,
    sources,
    meta: {
      readyForBooking: true,
      readyForPayments: true,
      multiProvider: configuredExternal.length > 1,
    },
  };

  if (merged.length) setCachedSearch(query, result);
  return result;
}

export async function getHotelAggregated(
  id: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">,
): Promise<Hotel | null> {
  if (isAvenirPropertyId(id)) {
    return marketplaceProvider.getHotel(id, query);
  }
  const marketplace = await marketplaceProvider.getHotel(id, query);
  if (marketplace) return marketplace;

  for (const provider of externalProviders) {
    if (!provider.isConfigured()) continue;
    const hotel = await provider.getHotel(id, query);
    if (hotel) return hotel;
  }
  return null;
}

export async function getSimilarHotelsAggregated(
  id: string,
  city: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">,
): Promise<Hotel[]> {
  if (isAvenirPropertyId(id)) {
    return marketplaceProvider.getSimilar(id, city, query);
  }
  const similar = await marketplaceProvider.getSimilar(id, city, query);
  if (similar.length) return similar;

  if (liteApiProvider.isConfigured()) {
    return liteApiProvider.getSimilar(id, city, query);
  }
  return [];
}

export function getDestinationCardsAggregated() {
  return getDestinationCards();
}
