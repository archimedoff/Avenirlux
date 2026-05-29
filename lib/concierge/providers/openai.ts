import { getOpenAiApiKey, getOpenAiModel } from "@/lib/concierge/config";
import { buildConciergeSystemPrompt } from "@/lib/concierge/content";
import type { ConciergeProvider, ConciergeProviderContext } from "@/lib/concierge/providers/types";

const MAX_HISTORY = 20;

export const openAiConciergeProvider: ConciergeProvider = {
  id: "openai",

  async *streamReply(context: ConciergeProviderContext) {
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const system = buildConciergeSystemPrompt(context.intent, context.hotels);
    const history = context.history.slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getOpenAiModel(),
        stream: true,
        temperature: 0.7,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          ...history,
          { role: "user", content: context.message },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`OpenAI request failed (${response.status}): ${errText.slice(0, 200)}`);
    }

    if (!response.body) {
      throw new Error("OpenAI returned an empty stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) yield token;
        } catch {
          /* skip malformed SSE chunk */
        }
      }
    }
  },
};
