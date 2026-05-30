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

Recommended `.env.local` (password kept separate — avoids encoding issues):

```bash
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_POOLER_HOST=aws-1-eu-central-1.pooler.supabase.com
SUPABASE_DB_PASSWORD=your_database_password
# Optional true direct host for migrations:
# SUPABASE_DB_HOST=db.your_project_ref.supabase.co
```

`npm run db:*` scripts build `DATABASE_URL` (port **6543**, `?pgbouncer=true`) and `DIRECT_URL` (port **5432**) with `encodeURIComponent` on the password.

Or paste full URIs (password must be URL-encoded if it contains `@`, `#`, `%`, etc.):

```bash
DATABASE_URL="postgresql://postgres.[ref]:[ENCODED_PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[ENCODED_PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
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

## Troubleshooting P1000 (authentication failed)

1. Reset the database password in Supabase → **Project Settings → Database**.
2. Copy the **URI** connection strings again (Session pooler + Direct).
3. If the password contains `@`, `#`, or `%`, URL-encode it in the connection string.
4. `DATABASE_URL` must use the **transaction pooler** (port **6543**, `?pgbouncer=true`).
5. `DIRECT_URL` must use **direct** connection (port **5432**) for `db push` / migrations.

Verify:

```bash
npm run db:verify
npm run db:push
npm run db:seed
npm run db:import
```


## Storage (property images)

1. Supabase Dashboard → **Storage** → New bucket `property-images` (public)
2. Add to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role (server only, never expose to client)
   - Optional: `SUPABASE_STORAGE_BUCKET=property-images`
3. Host uploads go to `POST /api/host/uploads`; URLs are stored in `property_images` and `cover_image`.

Without storage env vars, hosts can still paste image URLs.
