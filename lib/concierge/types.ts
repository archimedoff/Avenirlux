export type TripMode = "general" | "romantic" | "family" | "business";

export type ConciergeRole = "user" | "assistant";

export type ConciergeMessage = {
  id: string;
  role: ConciergeRole;
  content: string;
  createdAt: number;
};
