import "server-only";

import type { Hotel } from "@/lib/hotel-types";
import { hasLiteApiKey } from "@/lib/liteapi/config";
import {
  getHotelFromLiteApi,
  getSimilarHotelsFromLiteApi,
  searchHotelsFromLiteApi,
} from "@/lib/liteapi/search";
import { mapProviderError } from "@/lib/providers/hotels/errors";
import type {
  HotelInventoryProvider,
  HotelSearchQuery,
  HotelsSearchResult,
} from "@/lib/providers/hotels/types";

function tagLiteApi(hotels: Hotel[]): Hotel[] {
  return hotels.map((h) => ({ ...h, providerId: "liteapi" as const }));
}

export class LiteApiProvider implements HotelInventoryProvider {
  readonly id = "liteapi" as const;

  isConfigured(): boolean {
    return hasLiteApiKey();
  }

  async search(query: HotelSearchQuery): Promise<HotelsSearchResult> {
    if (!this.isConfigured()) {
      return {
        hotels: [],
        hasMore: false,
        error: "LiteAPI is not configured. Set LITEAPI_KEY or LITE_API_KEY.",
        errorCode: "unconfigured",
        sources: { liteapi: false },
      };
    }
    try {
      const result = await searchHotelsFromLiteApi(query);
      return {
        hotels: tagLiteApi(result.hotels),
        hasMore: result.hasMore,
        sources: { liteapi: true },
      };
    } catch (error) {
      const { message, code } = mapProviderError(error);
      return { hotels: [], hasMore: false, error: message, errorCode: code, sources: { liteapi: true } };
    }
  }

  async getHotel(
    id: string,
    query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">,
  ): Promise<Hotel | null> {
    if (!this.isConfigured()) return null;
    try {
      const h = await getHotelFromLiteApi(id, query);
      return h ? tagLiteApi([h])[0] : null;
    } catch {
      return null;
    }
  }

  async getSimilar(
    id: string,
    city: string,
    query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">,
  ): Promise<Hotel[]> {
    if (!this.isConfigured()) return [];
    try {
      return tagLiteApi(await getSimilarHotelsFromLiteApi(id, city, query));
    } catch {
      return [];
    }
  }
}

export const liteApiProvider = new LiteApiProvider();
