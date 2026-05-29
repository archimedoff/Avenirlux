import { runConciergeChat } from "@/lib/concierge/engine";
import { checkConciergeRateLimit } from "@/lib/concierge/rate-limit";
import type { ConciergeChatRequest, ConciergeStreamEvent, TripMode } from "@/lib/concierge/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ROUTE_TIMEOUT_MS = 58_000;

const VALID_MODES = new Set<TripMode>(["general", "romantic", "family", "business"]);

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  return request.headers.get("x-real-ip") ?? "anonymous";
}

function sseLine(event: ConciergeStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  const rate = checkConciergeRateLimit(clientKey(request));
  if (!rate.allowed) {
    return Response.json(
      {
        error: "Too many requests. Please wait a moment before trying again.",
        retryAfterMs: rate.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rate.retryAfterMs ?? 60_000) / 1000)),
          "X-RateLimit-Limit": String(rate.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  let body: ConciergeChatRequest;
  try {
    body = (await request.json()) as ConciergeChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) {
    return Response.json({ error: "Message must be 1–4000 characters" }, { status: 400 });
  }

  const mode = body.mode && VALID_MODES.has(body.mode) ? body.mode : undefined;
  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (m) =>
            m &&
            typeof m.content === "string" &&
            (m.role === "user" || m.role === "assistant"),
        )
        .slice(-24)
        .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 8000) }))
    : [];

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const routeAbort = AbortSignal.timeout(ROUTE_TIMEOUT_MS);
      try {
        const chatPromise = (async () => {
          for await (const event of runConciergeChat({ message, history, mode })) {
            if (routeAbort.aborted) break;
            controller.enqueue(encoder.encode(sseLine(event)));
            if (event.type === "error" || event.type === "failure") break;
          }
        })();
        await chatPromise;
      } catch {
        controller.enqueue(encoder.encode(sseLine({ type: "failure", retryable: true })));
        controller.enqueue(encoder.encode(sseLine({ type: "done" })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-RateLimit-Limit": String(rate.limit),
      "X-RateLimit-Remaining": String(rate.remaining),
    },
  });
}
