import { getHiddenGems, getItinerary, modeLabel } from "@/lib/concierge/content";
import type { ConciergeProvider, ConciergeContext } from "@/lib/concierge/providers/interface";
import type { ConciergeStreamEvent } from "@/lib/concierge/types";

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function buildSystemPrompt(ctx: ConciergeContext): string {
  const city = ctx.intent.city ?? "unspecified";
  const hotelSummary = ctx.hotels
    .map((h) => `- ${h.name} (${h.city}): from $${h.pricePerNight}/night, ${h.starRating}★, ${h.hotelType}`)
    .join("\n");
  return `You are the AvenirLux AI concierge — an ultra-premium luxury travel assistant.
Tone: refined, warm, concise, never salesy. Use elegant prose, occasional **bold** for section headers.
Trip mode: ${modeLabel(ctx.intent.mode)}. Destination: ${city}.
${hotelSummary ? `Available residences (cite by name when recommending):\n${hotelSummary}` : "No live hotels loaded — suggest the guest search /hotels."}
Include itinerary bullets if planning a trip. Mention 1-2 hidden gems for the city when relevant.
Do not invent hotel names beyond the list. Keep under 220 words.`;
}

export const openAiConciergeProvider: ConciergeProvider = {
  id: "openai",
  async *stream(ctx) {
    if (!hasOpenAiKey()) {
      yield { type: "error", message: "OpenAI key not configured" };
      return;
    }

    const meta = {
      mode: ctx.intent.mode,
      city: ctx.intent.city,
      itinerary: ctx.intent.wantsItinerary ? getItinerary(ctx.intent.mode, ctx.intent.city ?? "") : undefined,
      hiddenGems: ctx.intent.wantsHiddenGems ? getHiddenGems(ctx.intent.city) : undefined,
    };
    yield { type: "meta", meta };

    const messages = [
      { role: "system" as const, content: buildSystemPrompt(ctx) },
      ...ctx.history.slice(-6).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: ctx.message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        stream: true,
        temperature: 0.7,
        messages,
      }),
    });

    if (!res.ok || !res.body) {
      yield { type: "error", message: "OpenAI request failed" };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
          const text = json.choices?.[0]?.delta?.content;
          if (text) yield { type: "token", text };
        } catch {
          /* skip malformed chunks */
        }
      }
    }

    if (ctx.hotels.length) yield { type: "hotels", hotels: ctx.hotels };
    yield { type: "done" };
  },
};

export function isOpenAiAvailable(): boolean {
  return hasOpenAiKey();
}
