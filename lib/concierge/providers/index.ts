import { isOpenAiConfigured } from "@/lib/concierge/config";
import { isOpenAiHealthy } from "@/lib/concierge/health";
import { mockConciergeProvider } from "@/lib/concierge/providers/mock";
import { openAiConciergeProvider } from "@/lib/concierge/providers/openai";
import type { ConciergeProvider } from "@/lib/concierge/providers/types";

export type {
  ConciergeProvider,
  ConciergeProviderContext,
  ConciergeFallbackReason,
} from "@/lib/concierge/providers/types";

export function resolveConciergeProvider(): ConciergeProvider {
  if (isOpenAiConfigured() && isOpenAiHealthy()) return openAiConciergeProvider;
  return mockConciergeProvider;
}

export function getPreferredConciergeProviderId(): "openai" | "mock" {
  if (isOpenAiConfigured() && isOpenAiHealthy()) return "openai";
  return "mock";
}
