import { ConciergeProviderError } from "@/lib/concierge/errors";
import { fetchConciergeHotels } from "@/lib/concierge/hotels";
import {
  getOpenAiHealth,
  markOpenAiFailure,
  markOpenAiSuccess,
} from "@/lib/concierge/health";
import { parseIntent } from "@/lib/concierge/intent";
import { getPreferredConciergeProviderId } from "@/lib/concierge/providers";
import { mockConciergeProvider } from "@/lib/concierge/providers/mock";
import { openAiConciergeProvider } from "@/lib/concierge/providers/openai";
import type { ConciergeFallbackReason } from "@/lib/concierge/providers/types";
import {
  buildResponseCacheKey,
  getCachedConciergeResponse,
  setCachedConciergeResponse,
} from "@/lib/concierge/response-cache";
import { streamTextAsTokens } from "@/lib/concierge/stream-utils";
import type {
  ConciergeAiStatus,
  ConciergeChatRequest,
  ConciergeStreamEvent,
  TripMode,
} from "@/lib/concierge/types";

const DEFAULT_MODE: TripMode = "general";

function emitMeta(
  intent: ReturnType<typeof parseIntent>,
  provider: string,
  aiStatus: ConciergeAiStatus,
  fallback?: ConciergeFallbackReason,
): ConciergeStreamEvent {
  return {
    type: "meta",
    mode: intent.mode,
    city: intent.city,
    provider,
    aiStatus,
    notice: undefined,
  };
}

async function* replayCachedText(text: string): AsyncGenerator<ConciergeStreamEvent> {
  for await (const token of streamTextAsTokens(text, 8)) {
    yield { type: "token", text: token };
  }
}

async function* streamMock(
  context: Parameters<typeof mockConciergeProvider.streamReply>[0],
): AsyncGenerator<ConciergeStreamEvent> {
  for await (const token of mockConciergeProvider.streamReply(context)) {
    yield { type: "token", text: token };
  }
}

export async function* runConciergeChat(
  request: ConciergeChatRequest,
): AsyncGenerator<ConciergeStreamEvent, void, unknown> {
  const message = request.message?.trim();
  if (!message) {
    yield* replayCachedText("How may I assist with your journey today?");
    yield { type: "done" };
    return;
  }

  const mode = request.mode ?? DEFAULT_MODE;
  const history = (request.history ?? []).filter(
    (m) => m.content?.trim() && (m.role === "user" || m.role === "assistant"),
  );

  const intent = parseIntent(message, mode);
  const hotels = intent.wantsHotels && intent.city ? await fetchConciergeHotels(intent.city) : [];
  const cacheKey = buildResponseCacheKey(message, intent.mode, intent.city);

  const context = {
    message,
    history,
    mode: intent.mode,
    intent,
    hotels,
  };

  const preferred = getPreferredConciergeProviderId();
  const cached = getCachedConciergeResponse(cacheKey);

  if (preferred === "mock" && cached) {
    yield emitMeta(intent, "cache", "cached");
    if (hotels.length > 0) yield { type: "hotels", hotels };
    yield* replayCachedText(cached);
    yield { type: "done" };
    return;
  }

  yield emitMeta(
    intent,
    preferred,
    preferred === "openai" ? "live" : "curated",
    preferred === "mock" ? "unconfigured" : undefined,
  );
  if (hotels.length > 0) yield { type: "hotels", hotels };

  if (preferred === "mock") {
    yield* streamMock({ ...context, fallback: { reason: "unconfigured" } });
    yield { type: "done" };
    return;
  }

  try {
    let full = "";
    for await (const token of openAiConciergeProvider.streamReply(context)) {
      full += token;
      yield { type: "token", text: token };
    }

    if (full.trim().length >= 40) {
      setCachedConciergeResponse(cacheKey, full, intent.mode, intent.city);
    }
    markOpenAiSuccess();
    yield { type: "done" };
  } catch (error) {
    const code = error instanceof ConciergeProviderError ? error.code : "unknown";
    markOpenAiFailure(code);

    const cachedAfterFailure = getCachedConciergeResponse(cacheKey);
    if (cachedAfterFailure) {
      yield emitMeta(intent, "cache", "cached");
      yield* replayCachedText(cachedAfterFailure);
      yield { type: "done" };
      return;
    }

    yield { type: "failure", retryable: true };
    yield { type: "done" };
  }
}

export function getConciergeRuntimeHealth() {
  return {
    openai: getOpenAiHealth(),
    cache: { enabled: true },
  };
}
