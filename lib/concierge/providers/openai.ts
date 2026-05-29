import { getOpenAiApiKey, getOpenAiModel } from "@/lib/concierge/config";
import { buildConciergeSystemPrompt } from "@/lib/concierge/content";
import { classifyOpenAiHttpFailure, ConciergeProviderError } from "@/lib/concierge/errors";
import type { ConciergeProvider, ConciergeProviderContext } from "@/lib/concierge/providers/types";

const MAX_HISTORY = 20;

export const openAiConciergeProvider: ConciergeProvider = {
  id: "openai",

  async *streamReply(context: ConciergeProviderContext) {
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
      throw new ConciergeProviderError("auth", "OpenAI is not configured");
    }

    const system = buildConciergeSystemPrompt(context.intent, context.hotels);
    const history = context.history.slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    } catch {
      throw new ConciergeProviderError("network");
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      const code = classifyOpenAiHttpFailure(response.status, errText);
      throw new ConciergeProviderError(code);
    }

    if (!response.body) {
      throw new ConciergeProviderError("server");
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
