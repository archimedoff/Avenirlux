import "server-only";
const DEFAULT_BASE = "https://api.liteapi.travel/v3.0";

export function getLiteApiKey(): string {
  const key = process.env.LITE_API_KEY?.trim();
  if (!key) throw new Error("LITE_API_KEY is not configured");
  return key;
}

export function hasLiteApiKey(): boolean {
  return Boolean(process.env.LITE_API_KEY?.trim());
}

export function getLiteApiBaseUrl(): string {
  return process.env.LITE_API_BASE_URL?.trim() || DEFAULT_BASE;
}
