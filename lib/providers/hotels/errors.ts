import { LiteApiError } from "@/lib/liteapi/client";
import type { HotelSearchErrorCode } from "@/lib/providers/hotels/types";

export function mapProviderError(error: unknown): { message: string; code: HotelSearchErrorCode } {
  if (error instanceof LiteApiError) {
    if (error.status === 429) {
      return { message: "Hotel search is busy. Please try again in a moment.", code: "rate_limit" };
    }
    if (error.status === 408 || error.status === 504) {
      return { message: "Our hotel partners took too long to respond.", code: "timeout" };
    }
    return { message: "Unable to load live hotel rates right now.", code: "provider_error" };
  }
  const msg = error instanceof Error ? error.message : "Unable to load hotels";
  if (/timeout|timed out|ETIMEDOUT|AbortError/i.test(msg)) {
    return { message: "Our hotel partners took too long to respond.", code: "timeout" };
  }
  if (/rate limit|429/i.test(msg)) {
    return { message: "Hotel search is busy. Please try again shortly.", code: "rate_limit" };
  }
  return { message: msg, code: "provider_error" };
}
