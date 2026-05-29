const DEFAULT_DELAY_MS = 10;

export async function* streamTextAsTokens(text: string, delayMs = DEFAULT_DELAY_MS): AsyncGenerator<string> {
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    yield part;
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
}
