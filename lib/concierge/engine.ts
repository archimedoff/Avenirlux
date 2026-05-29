import { fetchConciergeHotels } from "@/lib/concierge/hotels";
import { parseIntent } from "@/lib/concierge/intent";
import { resolveConciergeProvider } from "@/lib/concierge/providers";
import { mockConciergeProvider } from "@/lib/concierge/providers/mock";
import type {
  ConciergeChatRequest,
  ConciergeStreamEvent,
  TripMode,
} from "@/lib/concierge/types";

const DEFAULT_MODE: TripMode = "general";

export async function* runConciergeChat(
  request: ConciergeChatRequest,
): AsyncGenerator<ConciergeStreamEvent, void, unknown> {
  const message = request.message?.trim();
  if (!message) {
    yield { type: "error", message: "Message is required." };
    return;
  }

  const mode = request.mode ?? DEFAULT_MODE;
  const history = (request.history ?? []).filter(
    (m) => m.content?.trim() && (m.role === "user" || m.role === "assistant"),
  );

  const intent = parseIntent(message, mode);
  let hotels = intent.wantsHotels && intent.city ? await fetchConciergeHotels(intent.city) : [];

  let provider = resolveConciergeProvider();

  yield {
    type: "meta",
    mode: intent.mode,
    city: intent.city,
    provider: provider.id,
  };

  if (hotels.length > 0) {
    yield { type: "hotels", hotels };
  }

  const context = {
    message,
    history,
    mode: intent.mode,
    intent,
    hotels,
  };

  try {
    for await (const token of provider.streamReply(context)) {
      yield { type: "token", text: token };
    }
  } catch (error) {
    if (provider.id !== "mock") {
      provider = mockConciergeProvider;
      yield { type: "meta", mode: intent.mode, city: intent.city, provider: "mock" };
      for await (const token of provider.streamReply(context)) {
        yield { type: "token", text: token };
      }
    } else {
      const msg = error instanceof Error ? error.message : "Concierge unavailable";
      yield { type: "error", message: msg };
      return;
    }
  }

  yield { type: "done" };
}
