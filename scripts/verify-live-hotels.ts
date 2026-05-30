/**
 * Smoke-test live LiteAPI inventory (no server-only imports).
 * Run: dotenv -e .env.local -- npx tsx scripts/verify-live-hotels.ts
 */

const BASE = process.env.LITE_API_BASE_URL?.trim() || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY?.trim() || process.env.LITE_API_KEY?.trim();
const CITY = process.env.VERIFY_CITY || "Paris";

function defaultCheckIn(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function defaultCheckOut(): string {
  const d = new Date();
  d.setDate(d.getDate() + 17);
  return d.toISOString().slice(0, 10);
}

async function liteApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": KEY!,
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`LiteAPI ${res.status}: ${text.slice(0, 300)}`);
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function main() {
  if (!KEY) {
    console.error("FAIL: LITEAPI_KEY / LITE_API_KEY not set");
    process.exit(1);
  }

  const checkIn = defaultCheckIn();
  const checkOut = defaultCheckOut();

  type RatesResponse = {
    data?: Array<{
      hotelId: string;
      roomTypes?: Array<{
        offerRetailRate?: { amount?: number };
        rates?: Array<{ retailRate?: { total?: Array<{ amount?: number }> } }>;
      }>;
    }>;
    hotels?: Array<{ id: string; name: string; main_photo?: string; thumbnail?: string }>;
  };

  const rates = await liteApi<RatesResponse>("/hotels/rates", {
    method: "POST",
    body: JSON.stringify({
      checkin: checkIn,
      checkout: checkOut,
      currency: "USD",
      guestNationality: "US",
      occupancies: [{ adults: 2 }],
      cityName: CITY,
      countryCode: "FR",
      maxRatesPerHotel: 1,
      limit: 8,
      timeout: 12,
      starRating: [4, 4.5, 5],
      minRating: 4,
    }),
  });

  const metaById = new Map((rates.hotels || []).map((h) => [h.id, h]));
  const items = rates.data || [];
  console.log("Search:", { city: CITY, rateItems: items.length, metaHotels: rates.hotels?.length ?? 0 });

  if (!items.length) {
    console.error("FAIL: no rate results");
    process.exit(1);
  }

  const firstId = items[0].hotelId;
  const meta = metaById.get(firstId);
  const total =
    items[0].roomTypes?.[0]?.offerRetailRate?.amount ??
    items[0].roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.amount;
  const image = meta?.main_photo || meta?.thumbnail;

  console.log("First listing:", {
    id: firstId,
    name: meta?.name,
    total,
    image: image?.slice(0, 70),
  });

  if (!meta?.name?.trim()) {
    console.error("FAIL: missing hotel name in LiteAPI metadata");
    process.exit(1);
  }
  if (!total || total <= 0) {
    console.error("FAIL: missing pricing");
    process.exit(1);
  }
  if (!image?.startsWith("http")) {
    console.error("FAIL: missing image URL");
    process.exit(1);
  }

  const detailRes = await fetch(
    `${BASE.replace(/\/$/, "")}/data/hotel?hotelId=${encodeURIComponent(firstId)}&timeout=8`,
    { headers: { Accept: "application/json", "X-API-Key": KEY } },
  );
  const detailText = await detailRes.text();
  if (!detailRes.ok) {
    console.error("FAIL: hotel detail", detailRes.status, detailText.slice(0, 200));
    process.exit(1);
  }
  const detailJson = JSON.parse(detailText) as {
    data?: { id: string; name: string; hotelImages?: Array<{ url?: string }> };
  };
  const hotel = detailJson.data;
  const gallery = (hotel?.hotelImages || []).map((i) => i.url).filter(Boolean);

  console.log("Detail:", { name: hotel?.name, galleryCount: gallery.length });

  if (!hotel?.name) {
    console.error("FAIL: detail missing name");
    process.exit(1);
  }
  if (!gallery.length) {
    console.error("FAIL: detail missing gallery images");
    process.exit(1);
  }

  console.log("OK: LiteAPI city search, pricing, availability, images verified");
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
