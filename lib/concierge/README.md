# AvenirLux Concierge

## OpenAI setup

1. Copy `.env.example` to `.env.local` in the project root.
2. Set your key (never commit this file):

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

3. Optional: `OPENAI_TIMEOUT_MS=55000`, `CONCIERGE_RATE_LIMIT_PER_MINUTE=30`
4. Restart the dev server: `npm run dev`
5. On Vercel: add the same variables in **Project → Settings → Environment Variables**.

## Architecture

- **API:** `POST /api/concierge/chat` (SSE) — key stays server-side only
- **Provider:** OpenAI **Responses API** via official `openai` SDK (streaming)
- **Fallback:** Curated mock when `OPENAI_API_KEY` is unset; cache replay on repeat queries
- **Health:** `GET /api/concierge/health`

## Stream events

`token` · `meta` · `hotels` · `failure` (retryable) · `done` · `error`
