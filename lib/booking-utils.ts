export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultCheckIn(): string {
  return addDays(new Date(), 14);
}

export function defaultCheckOut(): string {
  return addDays(new Date(), 17);
}

export function countNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  return Math.max(1, nights);
}

export function buildStayQuery(params: {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  hotelId?: string;
  roomId?: string;
  offset?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minStars?: number;
  amenities?: string[];
  categories?: string[];
}): string {
  const q = new URLSearchParams();
  if (params.city?.trim()) q.set("city", params.city.trim());
  if (params.checkIn) q.set("checkIn", params.checkIn);
  if (params.checkOut) q.set("checkOut", params.checkOut);
  if (params.guests) q.set("guests", String(params.guests));
  if (params.rooms && params.rooms > 1) q.set("rooms", String(params.rooms));
  if (params.hotelId) q.set("hotelId", params.hotelId);
  if (params.roomId) q.set("roomId", params.roomId);
  if (params.offset) q.set("offset", String(params.offset));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.minPrice !== undefined) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) q.set("maxPrice", String(params.maxPrice));
  if (params.minRating !== undefined) q.set("minRating", String(params.minRating));
  if (params.minStars !== undefined) q.set("minStars", String(params.minStars));
  if (params.amenities?.length) q.set("amenities", params.amenities.join(","));
  if (params.categories?.length) q.set("category", params.categories.join(","));
  return q.toString();
}

export function generateConfirmationRef(): string {
  return `AX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
