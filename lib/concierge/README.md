# AvenirLux Concierge

## Architecture

- **UI:** `components/concierge/` — floating button, modal, `/concierge`
- **API:** `POST /api/concierge/chat` (SSE), `GET /api/concierge/health`
- **Engine:** intent → LiteAPI hotels → OpenAI → cache → curated mock fallback
- **Providers:** `openai`, `mock` (modular under `providers/`)

## Fallback & resilience

1. OpenAI when configured and healthy (`lib/concierge/health.ts`)
2. Response cache reuse (45 min TTL, same message/mode/city)
3. Premium contextual mock (`mock-responses.ts`) — no raw API errors exposed

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Live OpenAI streaming |
| `OPENAI_MODEL` | Default `gpt-4o-mini` |
| `LITE_API_KEY` | Live hotel cards |
| `CONCIERGE_RATE_LIMIT_PER_MINUTE` | Per-IP limit (default 30/min) |
