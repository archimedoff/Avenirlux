import {
  getDestinationCardsAggregated,
  getHotelAggregated,
  getSimilarHotelsAggregated,
  searchHotelsAggregated,
} from "@/lib/providers/hotels/aggregator";

export type { HotelSearchQuery, HotelsSearchResult } from "@/lib/providers/hotels/types";

export async function fetchHotels(query: Parameters<typeof searchHotelsAggregated>[0]) {
  return searchHotelsAggregated(query);
}

export async function fetchHotelById(
  id: string,
  query: Parameters<typeof getHotelAggregated>[1],
) {
  return getHotelAggregated(id, query);
}

export async function fetchSimilarHotels(
  id: string,
  city: string,
  query: Parameters<typeof getSimilarHotelsAggregated>[2],
) {
  return getSimilarHotelsAggregated(id, city, query);
}

export function getDestinations() {
  return getDestinationCardsAggregated();
}
