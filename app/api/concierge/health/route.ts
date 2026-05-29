import { getConciergeRuntimeHealth } from "@/lib/concierge/engine";
import { getConciergeCacheStats } from "@/lib/concierge/response-cache";

export const runtime = "nodejs";

export async function GET() {
  const health = getConciergeRuntimeHealth();
  const cache = getConciergeCacheStats();

  return Response.json({
    openai: health.openai,
    cache,
    timestamp: new Date().toISOString(),
  });
}
