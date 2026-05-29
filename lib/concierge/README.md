# AvenirLux Concierge

## Architecture

- **UI:** `components/concierge/` — floating button, modal, `/concierge` page
- **API:** `POST /api/concierge/chat` — SSE stream (`token`, `meta`, `hotels`, `done`, `error`)
- **Engine:** `lib/concierge/engine.ts` — intent, LiteAPI hotels, provider routing
- **Providers:** `lib/concierge/providers/` — `openai` when `OPENAI_API_KEY` is set, `mock` fallback
- **Session memory:** client sends `history` on each request (current session)

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Live OpenAI streaming |
| `OPENAI_MODEL` | Default `gpt-4o-mini` |
| `LITE_API_KEY` | Live hotel cards in replies |
| `CONCIERGE_RATE_LIMIT_PER_MINUTE` | Per-IP limit (default 30/min) |

## Multi-model (future)

Add a `ConciergeProvider` in `providers/` and register it in `providers/index.ts`.
