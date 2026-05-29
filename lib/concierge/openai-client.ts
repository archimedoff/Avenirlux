import "server-only";
import OpenAI from "openai";

import { getOpenAiApiKey, getOpenAiTimeoutMs } from "@/lib/concierge/config";

let singleton: OpenAI | null = null;

/** Server-only OpenAI client. Never import from client components. */
export function getOpenAiClient(): OpenAI | null {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) return null;

  if (!singleton) {
    singleton = new OpenAI({
      apiKey,
      timeout: getOpenAiTimeoutMs(),
      maxRetries: 0,
    });
  }

  return singleton;
}
