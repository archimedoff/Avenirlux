import { getConciergeRateLimitMax } from "@/lib/concierge/config";

const WINDOW_MS = 60_000;

type Bucket = { count: number; windowStart: number };

/** In-memory limiter (per server instance). Swap for Redis/KV at scale. */
const buckets = new Map<string, Bucket>();

function pruneExpired(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterMs?: number;
};

export function checkConciergeRateLimit(clientKey: string): RateLimitResult {
  const limit = getConciergeRateLimitMax();
  const now = Date.now();
  pruneExpired(now);

  const bucket = buckets.get(clientKey);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(clientKey, { count: 1, windowStart: now });
    return { allowed: true, limit, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    const retryAfterMs = WINDOW_MS - (now - bucket.windowStart);
    return { allowed: false, limit, remaining: 0, retryAfterMs };
  }

  bucket.count += 1;
  return { allowed: true, limit, remaining: limit - bucket.count };
}
