import OpenAI from "openai";

import { getOpenAiModel, getOpenAiTimeoutMs } from "@/lib/concierge/config";
import { buildConciergeSystemPrompt } from "@/lib/concierge/content";
import { classifyOpenAiHttpFailure, ConciergeProviderError } from "@/lib/concierge/errors";
import { getOpenAiClient } from "@/lib/concierge/openai-client";
import type { ConciergeProvider, ConciergeProviderContext } from "@/lib/concierge/providers/types";

const MAX_HISTORY = 20;

function mapOpenAiError(error: unknown): ConciergeProviderError {
  if (error instanceof ConciergeProviderError) return error;

  if (error instanceof OpenAI.APIError) {
    const body =
      typeof error.error === "object" && error.error !== null
        ? JSON.stringify(error.error)
        : String(error.message ?? "");
    return new ConciergeProviderError(classifyOpenAiHttpFailure(error.status ?? 0, body));
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.includes("timed out")) {
      return new ConciergeProviderError("network");
    }
  }

  return new ConciergeProviderError("unknown");
}

export const openAiConciergeProvider: ConciergeProvider = {
  id: "openai",

  async *streamReply(context: ConciergeProviderContext) {
    const client = getOpenAiClient();
    if (!client) {
      throw new ConciergeProviderError("auth");
    }

    const instructions = buildConciergeSystemPrompt(context.intent, context.hotels);
    const history = context.history.slice(-MAX_HISTORY);

    const input: OpenAI.Responses.ResponseInput = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: context.message },
    ];

    const abort = new AbortController();
    const timeoutId = setTimeout(() => abort.abort(), getOpenAiTimeoutMs());

    try {
      const stream = await client.responses.create(
        {
          model: getOpenAiModel(),
          instructions,
          input,
          stream: true,
          temperature: 0.65,
          max_output_tokens: 800,
        },
        { signal: abort.signal },
      );

      for await (const event of stream) {
        if (event.type === "response.output_text.delta" && event.delta) {
          yield event.delta;
        }
      }
    } catch (error) {
      throw mapOpenAiError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
