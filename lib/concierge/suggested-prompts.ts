import type { TripMode } from "@/lib/concierge/types";

export type SuggestedPrompt = { id: string; label: string; message: string; mode?: TripMode };

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: "kyoto", label: "Quiet Kyoto", message: "Find me a quiet luxury hotel in Kyoto", mode: "general" },
  { id: "paris", label: "Romantic Paris", message: "Plan a romantic Paris weekend", mode: "romantic" },
  { id: "bali", label: "Bali villas", message: "Best beach villas in Bali", mode: "romantic" },
  { id: "dubai", label: "Dubai business", message: "Business stay in Dubai", mode: "business" },
];
