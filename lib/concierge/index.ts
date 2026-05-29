/**
 * AvenirLux Concierge — engine, providers, types.
 */
export { runConciergeChat } from "@/lib/concierge/engine";
export { resolveConciergeProvider } from "@/lib/concierge/providers";
export { getMockConciergeReply } from "@/lib/concierge/mock-responses";
export { SUGGESTED_PROMPTS } from "@/lib/concierge/suggested-prompts";
export type {
  ConciergeChatRequest,
  ConciergeHotelPick,
  ConciergeMessage,
  ConciergeRole,
  ConciergeStreamEvent,
  TripMode,
} from "@/lib/concierge/types";
export type { SuggestedPrompt } from "@/lib/concierge/suggested-prompts";
