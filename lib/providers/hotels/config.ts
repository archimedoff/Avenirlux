import "server-only";

export function getLiteApiKeyFromEnv(): string | undefined {
  return process.env.LITEAPI_KEY?.trim() || process.env.LITE_API_KEY?.trim() || undefined;
}

export function hasExpediaApiKey(): boolean {
  return Boolean(process.env.EXPEDIA_API_KEY?.trim());
}

export function getExpediaApiKey(): string {
  const key = process.env.EXPEDIA_API_KEY?.trim();
  if (!key) throw new Error("EXPEDIA_API_KEY is not configured");
  return key;
}
