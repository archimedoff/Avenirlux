import "server-only";

import type { Hotel } from "@/lib/hotel-types";
import {
  getPublishedPropertyById,
  getSimilarPublishedProperties,
  searchPublishedProperties,
} from "@/lib/properties/search";
import type {
  HotelInventoryProvider,
  HotelSearchQuery,
  HotelsSearchResult,
} from "@/lib/providers/hotels/types";

function tagMarketplace(hotels: Hotel[]): Hotel[] {
  return hotels.map((h) => ({ ...h, providerId: "marketplace" as const }));
}

export class MarketplaceProvider implements HotelInventoryProvider {
  readonly id = "marketplace" as const;

  isConfigured(): boolean {
    return true;
  }

  async search(query: HotelSearchQuery): Promise<HotelsSearchResult> {
    const hotels = tagMarketplace(
      await searchPublishedProperties({
        city: query.city,
        propertyType: query.propertyType,
        guests: query.guests,
        amenities: query.amenities,
        limit: query.limit ?? 24,
        offset: query.offset ?? 0,
      }),
    );
    return {
      hotels,
      hasMore: hotels.length >= (query.limit ?? 24),
      sources: { marketplace: true },
    };
  }

  async getHotel(
    id: string,
    _query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">,
  ): Promise<Hotel | null> {
    const h = await getPublishedPropertyById(id);
    return h ? tagMarketplace([h])[0] : null;
  }

  async getSimilar(id: string, city: string, _query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">): Promise<Hotel[]> {
    return tagMarketplace(await getSimilarPublishedProperties(id, city, 6));
  }
}

export const marketplaceProvider = new MarketplaceProvider();
