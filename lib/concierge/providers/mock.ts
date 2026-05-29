import { getMockConciergeReply } from "@/lib/concierge/mock-responses";
import type { ConciergeProvider, ConciergeProviderContext } from "@/lib/concierge/providers/types";

function* chunkText(text: string): Generator<string> {
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (part) yield part;
  }
}

export const mockConciergeProvider: ConciergeProvider = {
  id: "mock",

  async *streamReply(context: ConciergeProviderContext) {
    let text = getMockConciergeReply(context.message, context.mode);

    if (context.hotels.length > 0) {
      const names = context.hotels.map((h) => h.name).join(", ");
      text += `\n\nI have surfaced ${context.hotels.length} residence${context.hotels.length === 1 ? "" : "s"} from our live collection${context.intent.city ? ` in ${context.intent.city}` : ""}: ${names}. Open any card below for details and availability.`;
    } else if (!process.env.OPENAI_API_KEY?.trim()) {
      text += "\n\n_Add your OPENAI_API_KEY to enable full AI counsel; until then, I offer curated sample guidance._";
    }

    for (const chunk of chunkText(text)) {
      yield chunk;
      await new Promise((r) => setTimeout(r, 12));
    }
  },
};
