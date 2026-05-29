# AvenirLux — Supabase + Prisma

PostgreSQL on [Supabase](https://supabase.com) with [Prisma ORM](https://www.prisma.io).

## 1. Create a Supabase project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Save the database password.

## 2. Connection strings

**Project Settings → Database → Connection string**

| Variable | Use |
|----------|-----|
| `DATABASE_URL` | **Transaction pooler** (port 6543) — app runtime (Vercel) |
| `DIRECT_URL` | **Direct** connection (port 5432) — migrations |

Example `.env.local`:

```bash
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

On Vercel, add both variables for Production and Preview.

## 3. Apply schema

```bash
npm install
npm run db:push      # dev: sync schema without migration files
# or
npm run db:migrate   # creates prisma/migrations
npm run db:seed      # amenity catalog
npm run db:import    # optional: import data/*.json
```

## 4. Verify

```bash
npm run dev
```

- Host: create a listing at `/list-property` → appears under `/host/listings`
- Publish: PATCH listing `status: "published"` (or approve in admin flow)
- Public: published stays appear on `/hotels` and in the AI concierge

## Models

`User`, `Property`, `PropertyImage`, `Amenity`, `Booking`, `Conversation`, `UserFavorite`

## Fallback

Without `DATABASE_URL`, the app uses local JSON under `data/` (development only). Production should always set Supabase URLs.
