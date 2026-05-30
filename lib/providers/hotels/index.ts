export type {
  HotelInventoryProvider,
  HotelSearchErrorCode,
  HotelSearchQuery,
  HotelsSearchResult,
  HotelImage,
  NormalizedHotel,
  Offer,
  ProviderId,
} from "@/lib/providers/hotels/types";

export {
  searchHotelsAggregated,
  getHotelAggregated,
  getSimilarHotelsAggregated,
  getDestinationCardsAggregated,
} from "@/lib/providers/hotels/aggregator";

export { liteApiProvider } from "@/lib/providers/hotels/liteapi-provider";
export { expediaProvider } from "@/lib/providers/hotels/expedia-provider";
export { marketplaceProvider } from "@/lib/providers/hotels/marketplace-provider";

export { clearHotelSearchCache } from "@/lib/providers/hotels/cache";
