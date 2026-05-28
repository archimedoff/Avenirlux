import type { AvailabilityStatus, Hotel, HotelTypeLabel, LuxuryCategory, Room } from "@/lib/hotel-types";

type LiteHotelMeta = {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  address?: string;
  rating?: number;
  stars?: number;
  starRating?: number;
  hotelType?: string;
  hotelFacilities?: string[];
  facilities?: Array<{ name?: string }>;
};

type LiteRateItem = {
  hotelId: string;
  roomTypes?: Array<{
    roomTypeId?: string;
    offerId?: string;
    rates?: Array<{
      name?: string;
      maxOccupancy?: number;
      retailRate?: { total?: Array<{ amount?: number; currency?: string }> };
      cancellationPolicies?: { refundableTag?: string };
    }>;
    offerRetailRate?: { amount?: number; currency?: string };
  }>;
};

type LiteHotelDetail = {
  id: string;
  name: string;
  hotelDescription?: string;
  main_photo?: string;
  thumbnail?: string;
  address?: string;
  city?: string;
  country?: string;
  location?: { latitude?: number; longitude?: number };
  hotelImages?: Array<{ url?: string; urlHd?: string }>;
  hotelFacilities?: string[];
  facilities?: Array<{ name?: string }>;
  rating?: number;
  reviewCount?: number;
  rooms?: Array<{
    id: number | string;
    roomName?: string;
    description?: string;
    maxOccupancy?: number;
    photos?: Array<{ url?: string }>;
  }>;
  policies?: Array<{ name?: string; description?: string }>;
};

function guestScoreToStars(score?: number): number {
  if (!score || score <= 0) return 4.5;
  return score > 5 ? Math.min(5, Math.round((score / 2) * 10) / 10) : score;
}

function inferHotelType(facilities: string[], categories: LuxuryCategory[]): HotelTypeLabel {
  const text = facilities.join(" ").toLowerCase();
  if (categories.includes("villa") || /villa|residence|private home/.test(text)) return "Villa";
  if (categories.includes("resort") || /resort|beach resort/.test(text)) return "Resort";
  if (/boutique|design hotel/.test(text)) return "Boutique";
  if (/apartment|serviced|residence/.test(text)) return "Residence";
  return "Hotel";
}

function resolveStarRating(meta?: Pick<LiteHotelMeta, "starRating" | "stars" | "rating">): number {
  const raw = meta?.starRating ?? meta?.stars ?? meta?.rating;
  if (raw && raw > 0) return raw > 5 ? Math.min(5, raw / 2) : raw;
  return 5;
}

function facilitiesFromMeta(meta?: LiteHotelMeta): string[] {
  const fromFacilities = (meta?.facilities?.map((f) => f.name).filter(Boolean) as string[]) || [];
  const combined = [...(meta?.hotelFacilities || []), ...fromFacilities];
  return [...new Set(combined.map((s) => s.trim()).filter(Boolean))];
}

function inferCategories(facilities: string[]): LuxuryCategory[] {
  const text = facilities.join(" ").toLowerCase();
  const cats: LuxuryCategory[] = [];
  if (/beach|ocean|sea|water villa|overwater/.test(text)) cats.push("beachfront");
  if (/spa|wellness|hammam|sauna|massage/.test(text)) cats.push("spa");
  if (/villa|residence|private pool/.test(text)) cats.push("villa");
  if (/resort/.test(text)) cats.push("resort");
  if (/penthouse|suite|executive|presidential/.test(text)) cats.push("penthouse");
  if (!cats.length) cats.push("resort");
  return [...new Set(cats)].slice(0, 2);
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function mergeListingHotel(
  meta: LiteHotelMeta | undefined,
  rate: LiteRateItem,
  nights: number,
  cityFallback: string
): Hotel | null {
  if (!meta && !rate.hotelId) return null;
  const id = rate.hotelId;
  const roomType = rate.roomTypes?.[0];
  const total = roomType?.offerRetailRate?.amount ?? roomType?.rates?.[0]?.retailRate?.total?.[0]?.amount;
  const nightly = total && nights > 0 ? Math.round(total / nights) : total ?? 0;
  const refundable = roomType?.rates?.[0]?.cancellationPolicies?.refundableTag === "RFN";
  const facilities = facilitiesFromMeta(meta);

  const name = meta?.name || `AvenirLux Residence ${id}`;
  const image = meta?.main_photo || meta?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=82";
  const address = meta?.address || cityFallback;

  const categories = inferCategories(facilities);
  return {
    id,
    name,
    location: address,
    city: cityFallback,
    country: "",
    hotelType: inferHotelType(facilities, categories),
    starRating: resolveStarRating(meta),
    pricePerNight: nightly,
    rating: guestScoreToStars(meta?.rating),
    reviews: 0,
    image,
    gallery: [image],
    amenities: facilities.length ? facilities.slice(0, 8) : ["Concierge", "Fine dining", "Wellness", "Pool"],
    categories,
    coordinates: { lat: 0, lng: 0 },
    description: `A curated luxury stay in ${cityFallback}, selected for exceptional service and refined comfort.`,
    reviewsSummary: [],
    availability: refundable ? "available" : "limited",
    rooms: buildRoomsFromRate(rate, nightly),
    experiences: ["Private concierge", "Chef-led dining", "Wellness ritual"],
    cancellationPolicy: refundable
      ? "Flexible cancellation available on select rates."
      : "Non-refundable rate — please review terms before booking.",
    poeticTagline: `Evening light over ${cityFallback}, composed for unhurried arrival.`,
  };
}

function buildRoomsFromRate(rate: LiteRateItem, nightly: number): Room[] {
  const rt = rate.roomTypes?.[0];
  const rateName = rt?.rates?.[0]?.name || "Signature Room";
  const maxGuests = rt?.rates?.[0]?.maxOccupancy || 2;
  return [
    {
      id: rt?.roomTypeId || `${rate.hotelId}-room`,
      name: rateName,
      description: "Selected rate from live availability.",
      pricePerNight: nightly,
      maxGuests,
    },
  ];
}

export function transformHotelDetail(
  detail: LiteHotelDetail,
  rate: LiteRateItem | null,
  nights: number,
  cityFallback: string
): Hotel {
  const facilities = [
    ...(detail.hotelFacilities || []),
    ...(detail.facilities?.map((f) => f.name).filter(Boolean) as string[]),
  ];
  const gallery = (detail.hotelImages || [])
    .map((img) => img.urlHd || img.url)
    .filter(Boolean) as string[];
  const image = detail.main_photo || gallery[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=82";
  const lat = detail.location?.latitude ?? 0;
  const lng = detail.location?.longitude ?? 0;

  const categories = inferCategories(facilities);
  const base: Hotel = {
    id: detail.id,
    name: detail.name,
    location: detail.address || cityFallback,
    city: detail.city || cityFallback,
    country: detail.country || "",
    hotelType: inferHotelType(facilities, categories),
    starRating: resolveStarRating({ rating: detail.rating }),
    pricePerNight: 0,
    rating: guestScoreToStars(detail.rating),
    reviews: detail.reviewCount || 0,
    image,
    gallery: gallery.length ? gallery : [image],
    amenities: facilities.slice(0, 8).length ? facilities.slice(0, 8) : ["Concierge", "Fine dining", "Spa"],
    categories,
    coordinates: { lat, lng },
    description: stripHtml(detail.hotelDescription) || `An exceptional residence in ${detail.city || cityFallback}.`,
    reviewsSummary: detail.reviewCount
      ? [`Rated ${guestScoreToStars(detail.rating).toFixed(1)} by ${detail.reviewCount} verified guests.`]
      : ["Guests praise the calm atmosphere and attentive service."],
    availability: "available",
    rooms: [],
    experiences: ["Private concierge", "In-room dining", "Wellness access"],
    cancellationPolicy:
      detail.policies?.[0]?.description ||
      "Cancellation terms vary by room rate and are confirmed at booking.",
    poeticTagline: `Dawn over ${detail.city || cityFallback}, meant for quiet luxury.`,
  };

  if (rate) {
    const merged = mergeListingHotel(
      { id: detail.id, name: detail.name, main_photo: image, address: detail.address, rating: detail.rating },
      rate,
      nights,
      detail.city || cityFallback
    );
    if (merged) {
      base.pricePerNight = merged.pricePerNight;
      base.availability = merged.availability;
      base.rooms = merged.rooms;
    }
  }

  if (detail.rooms?.length) {
    const nightly = base.pricePerNight || 500;
    base.rooms = detail.rooms.slice(0, 6).map((room, index) => ({
      id: String(room.id),
      name: room.roomName || `Room ${index + 1}`,
      description: stripHtml(room.description) || "Elegantly appointed accommodation.",
      pricePerNight: Math.round(nightly * (index === 0 ? 1 : 1.2 + index * 0.15)),
      maxGuests: room.maxOccupancy || 2,
    }));
  }

  if (!base.rooms.length) {
    base.rooms = buildRoomsFromRate(rate || { hotelId: detail.id }, base.pricePerNight || 500);
  }

  return base;
}
