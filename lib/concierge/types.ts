import type { Hotel } from "@/lib/hotel-types";

export type TripMode = "general" | "romantic" | "family" | "business";

export type ConciergeRole = "user" | "assistant";

export type ConciergeMessage = {
  id: string;
  role: ConciergeRole;
  content: string;
  createdAt: number;
  hotels?: ConciergeHotelPick[];
  meta?: ConciergeReplyMeta;
};

export type ConciergeHotelPick = Pick<
  Hotel,
  "id" | "name" | "city" | "image" | "pricePerNight" | "rating" | "starRating" | "hotelType" | "categories"
>;

export type ConciergeReplyMeta = {
  mode: TripMode;
  city?: string;
  itinerary?: string[];
  hiddenGems?: string[];
};

export type ConciergeChatRequest = {
  message: string;
  history?: Array<{ role: ConciergeRole; content: string }>;
  mode?: TripMode;
};

export type ConciergeStreamEvent =
  | { type: "token"; text: string }
  | { type: "meta"; meta: ConciergeReplyMeta }
  | { type: "hotels"; hotels: ConciergeHotelPick[] }
  | { type: "done" }
  | { type: "error"; message: string };
