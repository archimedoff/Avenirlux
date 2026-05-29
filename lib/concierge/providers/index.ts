import { isOpenAiConfigured } from "@/lib/concierge/config";
import { mockConciergeProvider } from "@/lib/concierge/providers/mock";
import { openAiConciergeProvider } from "@/lib/concierge/providers/openai";
import type { ConciergeProvider } from "@/lib/concierge/providers/types";

export type { ConciergeProvider, ConciergeProviderContext } from "@/lib/concierge/providers/types";

export function resolveConciergeProvider(): ConciergeProvider {
  if (isOpenAiConfigured()) return openAiConciergeProvider;
  return mockConciergeProvider;
}
