# AvenirLux — Production Deployment (Vercel)

## Live URLs

| Environment | URL |
|-------------|-----|
| Production | https://avenirlux.vercel.app |
| Custom domain | https://www.avenirlux.com |
| Health | `/api/health` |
| Stripe webhook | `https://<domain>/api/webhooks/stripe` |

Deploys auto-trigger on push to `main` (GitHub ↔ Vercel).

## Pre-deploy (local)

```bash
npm run security:check
npm run build
npm run verify:production
npm run db:verify
npm run verify:hotels
```

## Vercel env vars (Production)

**Required:** `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `DIRECT_URL`, `LITE_API_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

**Recommended:** `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, `ADMIN_EMAILS`

Never use `NEXT_PUBLIC_` for secrets (Stripe secret, service role key, Resend, OpenAI, DATABASE_URL).

## Database (one-time)

```bash
npm run db:push
```

## Post-deploy smoke test

```bash
npm run smoke:production
SMOKE_BASE_URL=https://www.avenirlux.com npm run smoke:production
```

Health should return `"database":"ok"` and `"stripe":"ok"` when fully configured.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `database: missing` on health | Add DATABASE_URL + DIRECT_URL in Vercel, redeploy |
| `stripe: missing` | Add all Stripe vars |
| Upload `Invalid Compact JWS` | Regenerate Supabase service role key |
| OAuth redirect error | AUTH_URL must match production domain exactly |
