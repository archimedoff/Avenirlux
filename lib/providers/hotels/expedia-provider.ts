import "server-only";

import type { Hotel } from "@/lib/hotel-types";
import { hasExpediaApiKey } from "@/lib/providers/hotels/config";
import type {
  HotelInventoryProvider,
  HotelSearchQuery,
  HotelsSearchResult,
} from "@/lib/providers/hotels/types";

/**
 * Expedia Rapid API — architecture-ready stub.
 * Wire Rapid Availability + Content APIs here when EXPEDIA_API_KEY is provisioned.
 */
export class ExpediaProvider implements HotelInventoryProvider {
  readonly id = "expedia" as const;

  isConfigured(): boolean {
    return hasExpediaApiKey();
  }

  async search(_query: HotelSearchQuery): Promise<HotelsSearchResult> {
    if (!this.isConfigured()) {
      return { hotels: [], hasMore: false, sources: { expedia: false } };
    }
    // TODO: POST /properties/availability + content merge
    return {
      hotels: [],
      hasMore: false,
      error: "Expedia provider is not yet enabled.",
      errorCode: "unconfigured",
      sources: { expedia: true },
    };
  }

  async getHotel(_id: string, _query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">): Promise<Hotel | null> {
    return null;
  }

  async getSimilar(_id: string, _city: string, _query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">): Promise<Hotel[]> {
    return [];
  }
}

export const expediaProvider = new ExpediaProvider();
