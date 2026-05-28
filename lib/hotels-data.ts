/**
 * Public facade for hotel data.
 * All runtime hotel discovery flows through LiteAPI via `hotels-service`.
 */
export {
  fetchHotels,
  fetchHotelById,
  fetchSimilarHotels,
  getDestinations,
  type HotelSearchQuery,
  type HotelsSearchResult,
} from "@/lib/hotels-service";

export type { Hotel, HotelFilters, LuxuryCategory } from "@/lib/hotel-types";
