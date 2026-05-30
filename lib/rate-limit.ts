const WINDOW_MS = 60_000;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function pruneExpired(now: number) {
  if (buckets.size < 1000) return;
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

export function checkRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, limit, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, limit, remaining: 0, retryAfterMs: WINDOW_MS - (now - bucket.windowStart) };
  }
  bucket.count += 1;
  return { allowed: true, limit, remaining: limit - bucket.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function rateLimitResponse(result: RateLimitResult) {
  const headers: Record<string, string> = {
    "Retry-After": String(Math.ceil((result.retryAfterMs ?? 60_000) / 1000)),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
