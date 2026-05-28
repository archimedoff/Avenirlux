import { getHiddenGems, getItinerary, modeLabel } from "@/lib/concierge/content";
import type { ConciergeProvider, ConciergeContext } from "@/lib/concierge/providers/interface";
import type { ConciergeStreamEvent } from "@/lib/concierge/types";

function buildNarrative(ctx: ConciergeContext): string {
  const { intent, hotels } = ctx;
  const city = intent.city ?? (hotels[0]?.city || "the world");
  const label = modeLabel(intent.mode);
  const parts: string[] = [];

  parts.push(
    `A pleasure to assist you. I have composed a ${label.toLowerCase()} perspective for ${city} — unhurried, considered, and quietly exceptional.`,
  );

  if (intent.wantsItinerary || intent.mode !== "general") {
    parts.push("\n\n**Suggested rhythm**\n");
    getItinerary(intent.mode, city).forEach((line, i) => {
      parts.push(`${i + 1}. ${line}`);
    });
  }

  if (intent.wantsHiddenGems) {
    parts.push("\n\n**Hidden gems**\n");
    getHiddenGems(intent.city).forEach((gem) => parts.push(`• ${gem}`));
  }

  if (hotels.length) {
    parts.push(
      `\n\nI have selected ${hotels.length} residence${hotels.length > 1 ? "s" : ""} with live availability — each meets our four- and five-star standard. Explore them below; I can refine by neighborhood, spa, or villa preference.`,
    );
  } else if (intent.wantsHotels) {
    parts.push(
      "\n\nI could not retrieve live availability for this search at the moment. Try naming a destination from our collection, or browse /hotels directly.",
    );
  } else {
    parts.push("\n\nTell me a city, dates, or travel mood — romantic, family, or business — and I shall tailor hotels and an itinerary.");
  }

  return parts.join("\n");
}

async function* streamText(text: string): AsyncGenerator<ConciergeStreamEvent> {
  const words = text.split(/(\s+)/);
  for (const chunk of words) {
    yield { type: "token", text: chunk };
    await new Promise((r) => setTimeout(r, 18));
  }
}

export const localConciergeProvider: ConciergeProvider = {
  id: "local",
  async *stream(ctx) {
    const narrative = buildNarrative(ctx);
    const meta = {
      mode: ctx.intent.mode,
      city: ctx.intent.city,
      itinerary: ctx.intent.wantsItinerary ? getItinerary(ctx.intent.mode, ctx.intent.city ?? "") : undefined,
      hiddenGems: ctx.intent.wantsHiddenGems ? getHiddenGems(ctx.intent.city) : undefined,
    };
    yield { type: "meta", meta };
    yield* streamText(narrative);
    if (ctx.hotels.length) yield { type: "hotels", hotels: ctx.hotels };
    yield { type: "done" };
  },
};
