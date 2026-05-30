import "server-only";

import { getLiteApiKeyFromEnv } from "@/lib/providers/hotels/config";

const DEFAULT_BASE = "https://api.liteapi.travel/v3.0";

export function getLiteApiKey(): string {
  const key = getLiteApiKeyFromEnv();
  if (!key) throw new Error("LITEAPI_KEY or LITE_API_KEY is not configured");
  return key;
}

export function hasLiteApiKey(): boolean {
  return Boolean(getLiteApiKeyFromEnv());
}

export function getLiteApiBaseUrl(): string {
  return process.env.LITE_API_BASE_URL?.trim() || DEFAULT_BASE;
}
