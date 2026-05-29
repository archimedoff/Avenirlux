import { buildMockConciergeReply } from "@/lib/concierge/mock-responses";
import { streamTextAsTokens } from "@/lib/concierge/stream-utils";
import type { ConciergeProvider, ConciergeProviderContext } from "@/lib/concierge/providers/types";

export const mockConciergeProvider: ConciergeProvider = {
  id: "mock",

  async *streamReply(context: ConciergeProviderContext) {
    const fallbackReason =
      context.fallback?.reason === "quota"
        ? "quota"
        : context.fallback?.reason
          ? "unavailable"
          : null;

    const text = buildMockConciergeReply({
      message: context.message,
      mode: context.mode,
      intent: context.intent,
      hotels: context.hotels,
      history: context.history,
      fallbackReason,
    });

    yield* streamTextAsTokens(text);
  },
};
