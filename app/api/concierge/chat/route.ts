import { runConciergeChat } from "@/lib/concierge/engine";
import type { ConciergeChatRequest, ConciergeStreamEvent } from "@/lib/concierge/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function encodeSse(event: ConciergeStreamEvent): string {
  return `data: ${JSON.stringify(event)}

`;
}

export async function POST(request: Request) {
  let body: ConciergeChatRequest;
  try {
    body = (await request.json()) as ConciergeChatRequest;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of runConciergeChat(body)) {
          controller.enqueue(encoder.encode(encodeSse(event)));
        }
      } catch (err) {
        console.error("[concierge/chat]", err);
        controller.enqueue(
          encoder.encode(encodeSse({ type: "error", message: "Concierge unavailable" })),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
