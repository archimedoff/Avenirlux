import { parseIntent } from "@/lib/concierge/intent";
import { fetchConciergeHotels } from "@/lib/concierge/hotels";
import { localConciergeProvider } from "@/lib/concierge/providers/local-provider";
import { isOpenAiAvailable, openAiConciergeProvider } from "@/lib/concierge/providers/openai-provider";
import type { ConciergeChatRequest, ConciergeStreamEvent, TripMode } from "@/lib/concierge/types";

export function selectConciergeProvider() {
  if (isOpenAiAvailable()) return openAiConciergeProvider;
  return localConciergeProvider;
}

export async function* runConciergeChat(req: ConciergeChatRequest): AsyncGenerator<ConciergeStreamEvent> {
  const message = req.message?.trim();
  if (!message) {
    yield { type: "error", message: "Please share how we may assist your journey." };
    return;
  }

  const intent = parseIntent(message, req.mode);
  let hotels = intent.wantsHotels || intent.city ? await fetchConciergeHotels(intent.city, 4) : [];
  if (!hotels.length && intent.city) {
    hotels = await fetchConciergeHotels(intent.city, 4);
  }

  const history = req.history ?? [];
  const context = {
    message,
    intent,
    hotels,
    history,
    mode: intent.mode as TripMode,
  };

  const primary = selectConciergeProvider();

  async function* runWith(provider: typeof primary) {
    for await (const event of provider.stream(context)) {
      yield event;
    }
  }

  try {
    if (primary.id === "openai") {
      let failed = false;
      for await (const event of primary.stream(context)) {
        if (event.type === "error") {
          failed = true;
          break;
        }
        yield event;
        if (event.type === "done") return;
      }
      if (failed) yield* runWith(localConciergeProvider);
      return;
    }
    yield* runWith(primary);
  } catch (err) {
    console.error("[concierge]", err);
    if (primary.id === "openai") {
      try {
        yield* runWith(localConciergeProvider);
        return;
      } catch {
        /* noop */
      }
    }
    yield { type: "error", message: "Our concierge is momentarily unavailable. Please try again." };
  }
}
