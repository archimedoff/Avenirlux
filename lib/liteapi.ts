import type { Hotel } from "@/lib/hotel-types";

type FetchLiteApiHotelsOptions = {
  id?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

type FetchLiteApiRateOptions = {
  hotelId: string;
  countryCode?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

const COMMON_CITY_COUNTRY: Record<string, string> = {
  dubai: "AE",
  paris: "FR",
  london: "GB",
  istanbul: "TR",
  barcelona: "ES",
  chamonix: "FR",
  singapore: "SG",
  tokyo: "JP",
  newyork: "US",
  "new york": "US",
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  uae: "AE",
  "united arab emirates": "AE",
  france: "FR",
  "united kingdom": "GB",
  uk: "GB",
  turkey: "TR",
  turkiye: "TR",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

function normalizeCityKey(value: string): string {
  return value.trim().toLowerCase();
}

function resolveCityAndCountry(city?: string): { cityName?: string; countryCode?: string; normalizedInput?: string } {
  if (!city?.trim()) {
    return {};
  }

  const raw = city.trim();
  const parts = raw.split(",").map((item) => item.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const cityName = parts[0];
    const second = parts[1];
    const secondNormalized = normalizeCityKey(second);

    if (second.length === 2) {
      const countryCode = second.toUpperCase();
      return { cityName, countryCode, normalizedInput: `${cityName}, ${countryCode}` };
    }

    const mappedCountryCode = COUNTRY_NAME_TO_CODE[secondNormalized];
    if (mappedCountryCode) {
      return { cityName, countryCode: mappedCountryCode, normalizedInput: `${cityName}, ${mappedCountryCode}` };
    }

    return { cityName };
  }

  const mappedCountryCode = COMMON_CITY_COUNTRY[normalizeCityKey(raw)];
  if (mappedCountryCode) {
    return {
      cityName: raw,
      countryCode: mappedCountryCode,
      normalizedInput: `${raw}, ${mappedCountryCode}`,
    };
  }

  return { cityName: raw };
}

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getString(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function parseHotel(raw: any, index: number): Hotel {
  const city =
    getString(raw?.city) || getString(raw?.address?.city) || getString(raw?.location?.city) || "Unknown city";
  const country =
    getString(raw?.country) ||
    getString(raw?.countryName) ||
    getString(raw?.address?.country) ||
    getString(raw?.location?.country) ||
    "Unknown country";

  const location =
    getString(raw?.location) ||
    getString(raw?.neighborhood) ||
    getString(raw?.address?.line1) ||
    getString(raw?.address?.street) ||
    "Central district";

  const image =
    getString(raw?.main_photo) ||
    getString(raw?.image) ||
    getString(raw?.thumbnail) ||
    getString(raw?.main_image) ||
    getString(raw?.heroImage) ||
    getString(raw?.images?.[0]) ||
    getString(raw?.gallery?.[0]) ||
    FALLBACK_IMAGE;

  const gallerySource = Array.isArray(raw?.gallery)
    ? raw.gallery
    : Array.isArray(raw?.images)
      ? raw.images
      : Array.isArray(raw?.photos)
        ? raw.photos
        : [];

  const gallery = gallerySource
    .map((item: unknown) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item) return String((item as { url: unknown }).url);
      return "";
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    id: getString(raw?.id) || getString(raw?.hotelId) || getString(raw?.hotel_id) || getString(raw?._id) || `hotel-${index}`,
    name: getString(raw?.name) || getString(raw?.hotelName) || "Unnamed Hotel",
    location,
    city,
    country,
    pricePerNight:
      toNumber(raw?.pricePerNight) ||
      toNumber(raw?.price) ||
      toNumber(raw?.rate?.amount) ||
      toNumber(raw?.minRate) ||
      0,
    rating: toNumber(raw?.rating) || toNumber(raw?.stars) || toNumber(raw?.reviewScore) || 0,
    reviews: toNumber(raw?.reviews) || toNumber(raw?.reviewCount) || 0,
    image,
    gallery: gallery.length > 0 ? gallery : [image],
    amenities: Array.isArray(raw?.amenities)
      ? raw.amenities.slice(0, 6)
      : Array.isArray(raw?.facilities)
        ? raw.facilities.slice(0, 6)
        : ["WiFi", "Breakfast", "24/7 Support"],
    description:
      getString(raw?.description) ||
      getString(raw?.shortDescription) ||
      "Comfortable stay with modern amenities and a great location.",
  };
}

function getApiKey(): string {
  const key = process.env.LITE_API_KEY;
  if (!key) {
    throw new Error("Missing LITE_API_KEY. Add it to .env.local.");
  }
  return key;
}

function getBaseUrl(): string {
  const baseUrl = process.env.LITE_API_BASE_URL || "https://api.liteapi.travel/v3.0";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

async function requestLiteApiGet(url: URL): Promise<any> {
  const apiKey = getApiKey();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Api-Key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("LiteAPI upstream GET error", {
      url: url.toString(),
      status: response.status,
      body,
    });
    throw new Error(`LiteAPI request failed (${response.status}): ${body || response.statusText}`);
  }

  return response.json();
}

async function requestLiteApiPost(url: URL, body: unknown): Promise<any> {
  const apiKey = getApiKey();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("LiteAPI upstream POST error", {
      url: url.toString(),
      status: response.status,
      body: responseBody,
      requestBody: body,
    });
    throw new Error(`LiteAPI request failed (${response.status}): ${responseBody || response.statusText}`);
  }

  return response.json();
}

function extractHotels(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.hotels)) return payload.hotels;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.hotels)) return payload.data.hotels;
  if (Array.isArray(payload?.results)) return payload.results;

  if (payload?.hotel && typeof payload.hotel === "object") {
    return [payload.hotel];
  }

  if (payload && typeof payload === "object") {
    return [payload];
  }

  return [];
}

function extractRatePrice(payload: any): number | null {
  const entries = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.options)
      ? payload.options
      : [];

  const firstEntry = entries[0];
  if (!firstEntry) return null;

  const firstRate = firstEntry?.roomTypes?.[0]?.rates?.[0];

  const amount =
    firstRate?.retailRate?.total?.[0]?.amount ??
    firstRate?.retailRate?.suggestedSellingPrice?.[0]?.amount ??
    firstEntry?.offerRetailRate?.amount ??
    firstEntry?.suggestedSellingPrice?.amount ??
    firstEntry?.price?.net ??
    firstEntry?.price?.gross ??
    firstEntry?.price?.amount;

  const numeric = toNumber(amount, NaN);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export async function fetchLiteApiHotels(options: FetchLiteApiHotelsOptions = {}): Promise<Hotel[]> {
  const normalizedBaseUrl = getBaseUrl();
  const url = new URL("data/hotels", normalizedBaseUrl);

  if (options.id) {
    url.searchParams.set("hotelIds", options.id);
  } else {
    const { cityName, countryCode, normalizedInput } = resolveCityAndCountry(options.city);

    if (normalizedInput && options.city && normalizedInput !== options.city) {
      console.info(`Normalized city search: "${options.city}" -> "${normalizedInput}"`);
    }

    if (cityName) {
      url.searchParams.set("cityName", cityName);
    }
    if (countryCode) {
      url.searchParams.set("countryCode", countryCode);
    }
  }

  const payload = await requestLiteApiGet(url);
  return extractHotels(payload).map(parseHotel);
}

export async function fetchLiteApiHotelById(id: string): Promise<Hotel | null> {
  const hotels = await fetchLiteApiHotels({ id });
  return hotels.find((hotel) => hotel.id === id) ?? hotels[0] ?? null;
}

export async function fetchLiteApiHotelPrice(options: FetchLiteApiRateOptions): Promise<number | null> {
  const normalizedBaseUrl = getBaseUrl();
  const url = new URL("hotels/rates", normalizedBaseUrl);

  const payload = {
    hotelIds: [options.hotelId],
    currency: "USD",
    guestNationality: (options.countryCode || "US").toUpperCase(),
    checkin: options.checkIn,
    checkout: options.checkOut,
    occupancies: [
      {
        adults: Math.max(1, options.guests),
      },
    ],
  };

  const response = await requestLiteApiPost(url, payload);
  const nightlyPrice = extractRatePrice(response);

  console.info("LiteAPI rates lookup", {
    hotelId: options.hotelId,
    checkin: options.checkIn,
    checkout: options.checkOut,
    adults: Math.max(1, options.guests),
    hasData: Array.isArray(response?.data) ? response.data.length : 0,
    nightlyPrice,
  });

  return nightlyPrice;
}
