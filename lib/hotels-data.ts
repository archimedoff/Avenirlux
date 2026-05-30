/**
 * Public facade for hotel data.
 * All runtime hotel discovery flows through the provider aggregator in `hotels-service`.
 */
export {
  fetchHotels,
  fetchHotelById,
  fetchSimilarHotels,
  getDestinations,
  type HotelSearchQuery,
  type HotelsSearchResult,
} from "@/lib/hotels-service";

export type { HotelSearchErrorCode } from "@/lib/providers/hotels/types";

export type { Hotel, HotelFilters, LuxuryCategory } from "@/lib/hotel-types";
