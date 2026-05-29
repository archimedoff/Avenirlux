export function getOpenAiApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || undefined;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function getConciergeRateLimitMax(): number {
  const raw = process.env.CONCIERGE_RATE_LIMIT_PER_MINUTE;
  const n = raw ? Number.parseInt(raw, 10) : 30;
  return Number.isFinite(n) && n > 0 ? n : 30;
}
