import type { Hotel, Room } from "@/lib/hotel-types";

export type ProviderId = "marketplace" | "liteapi" | "expedia";

export type HotelSearchQuery = {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  offset?: number;
  limit?: number;
  propertyType?: string;
  amenities?: string[];
};

export type HotelSearchErrorCode =
  | "unconfigured"
  | "timeout"
  | "rate_limit"
  | "provider_error"
  | "partial";

export type HotelsSearchResult = {
  hotels: Hotel[];
  hasMore: boolean;
  error?: string;
  errorCode?: HotelSearchErrorCode;
  sources: Partial<Record<ProviderId, boolean>>;
  cached?: boolean;
  /** Future: Stripe checkout, itinerary AI */
  meta?: {
    readyForBooking?: boolean;
    readyForPayments?: boolean;
    multiProvider?: boolean;
  };
};

/** Bookable rate from a supplier (LiteAPI offerId, future Expedia). */
export type Offer = {
  id: string;
  roomId: string;
  providerId: ProviderId;
  totalPrice: number;
  nightlyPrice: number;
  currency: string;
  refundable: boolean;
  cancellationPolicy?: string;
};

export type HotelImage = {
  url: string;
  hdUrl?: string;
  caption?: string;
};

export type NormalizedHotel = Hotel & {
  providerId: ProviderId;
  offers?: Offer[];
  images?: HotelImage[];
};

export interface HotelInventoryProvider {
  readonly id: ProviderId;
  isConfigured(): boolean;
  search(query: HotelSearchQuery): Promise<HotelsSearchResult>;
  getHotel(
    id: string,
    query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">,
  ): Promise<Hotel | null>;
  getSimilar(
    id: string,
    city: string,
    query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">,
  ): Promise<Hotel[]>;
}
