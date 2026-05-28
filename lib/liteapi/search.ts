import { countNights, defaultCheckIn, defaultCheckOut } from "@/lib/booking-utils";
import { liteApiRequest } from "@/lib/liteapi/client";
import { resolveCountryCode } from "@/lib/liteapi/destinations";
import { mergeListingHotel, transformHotelDetail } from "@/lib/liteapi/transform";
import type { Hotel } from "@/lib/hotel-types";

export type HotelSearchQuery = {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  offset?: number;
  limit?: number;
};

type RatesResponse = {
  data?: Array<{
    hotelId: string;
    roomTypes?: Array<{
      roomTypeId?: string;
      offerId?: string;
      rates?: Array<{
        name?: string;
        maxOccupancy?: number;
        retailRate?: { total?: Array<{ amount?: number }> };
        cancellationPolicies?: { refundableTag?: string };
      }>;
      offerRetailRate?: { amount?: number };
    }>;
  }>;
  hotels?: Array<{
    id: string;
    name: string;
    main_photo?: string;
    thumbnail?: string;
    address?: string;
    rating?: number;
  }>;
};

type HotelDetailResponse = {
  data?: Record<string, unknown>;
};

function buildRatesBody(query: HotelSearchQuery) {
  const checkIn = query.checkIn || defaultCheckIn();
  const checkOut = query.checkOut || defaultCheckOut();
  const guests = query.guests || 2;
  const city = query.city?.trim();
  const countryCode = city ? resolveCountryCode(city) : undefined;

  const body: Record<string, unknown> = {
    checkin: checkIn,
    checkout: checkOut,
    currency: "USD",
    guestNationality: "US",
    occupancies: [{ adults: guests }],
    maxRatesPerHotel: 1,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    timeout: 12,
    starRating: [4, 4.5, 5],
    minRating: 4,
  };

  if (city && countryCode) {
    body.cityName = city;
    body.countryCode = countryCode;
  } else if (city) {
    body.aiSearch = `luxury hotels in ${city}`;
  } else {
    body.aiSearch = "luxury hotels";
  }

  return { body, checkIn, checkOut, city: city || "Worldwide" };
}

export async function searchHotelsFromLiteApi(query: HotelSearchQuery): Promise<{
  hotels: Hotel[];
  hasMore: boolean;
}> {
  const { body, checkIn, checkOut, city } = buildRatesBody(query);
  const nights = countNights(checkIn, checkOut);

  const response = await liteApiRequest<RatesResponse>("/hotels/rates", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const metaById = new Map((response.hotels || []).map((h) => [h.id, h]));
  const hotels: Hotel[] = [];

  for (const item of response.data || []) {
    const meta = metaById.get(item.hotelId);
    const hotel = mergeListingHotel(meta, item, nights, city);
    if (hotel) {
      if (meta?.address && !hotel.location) hotel.location = meta.address;
      if (meta?.rating) hotel.rating = meta.rating > 5 ? Math.min(5, meta.rating / 2) : meta.rating;
      hotels.push(hotel);
    }
  }

  const limit = query.limit ?? 20;
  const hasMore = (response.data?.length || 0) >= limit;

  return { hotels, hasMore };
}

export async function getHotelFromLiteApi(
  hotelId: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests" | "city">
): Promise<Hotel | null> {
  const checkIn = query.checkIn || defaultCheckIn();
  const checkOut = query.checkOut || defaultCheckOut();
  const guests = query.guests || 2;
  const nights = countNights(checkIn, checkOut);
  const cityFallback = query.city || "";

  const detailRes = await liteApiRequest<HotelDetailResponse>("/data/hotel", {
    searchParams: { hotelId, timeout: "8" },
  });

  const detail = (detailRes.data || detailRes) as Parameters<typeof transformHotelDetail>[0];
  if (!detail?.id) return null;

  let rateItem: NonNullable<RatesResponse["data"]>[number] | null = null;
  try {
    const ratesRes = await liteApiRequest<RatesResponse>("/hotels/rates", {
      method: "POST",
      body: JSON.stringify({
        hotelIds: [hotelId],
        checkin: checkIn,
        checkout: checkOut,
        currency: "USD",
        guestNationality: "US",
        occupancies: [{ adults: guests }],
        includeHotelData: true,
        maxRatesPerHotel: 8,
        roomMapping: true,
        timeout: 12,
      }),
    });
    rateItem = ratesRes.data?.[0] ?? null;
  } catch {
    rateItem = null;
  }

  return transformHotelDetail(detail, rateItem, nights, cityFallback || detail.city || "");
}

export async function getSimilarHotelsFromLiteApi(
  hotelId: string,
  city: string,
  query: Pick<HotelSearchQuery, "checkIn" | "checkOut" | "guests">
): Promise<Hotel[]> {
  const { hotels } = await searchHotelsFromLiteApi({ ...query, city, limit: 8 });
  return hotels.filter((h) => h.id !== hotelId).slice(0, 3);
}
