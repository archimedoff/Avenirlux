/**
 * Build Supabase Postgres URLs with a URL-encoded password.
 * Used by db:* scripts so special characters in passwords never break the URI.
 */
export type ComposedDatabaseUrls = {
  databaseUrl: string;
  directUrl: string;
};

const PLACEHOLDER = /\[YOUR-PASSWORD\]/i;
function resolvePassword(): string {
  const fromEnv = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (fromEnv && !PLACEHOLDER.test(fromEnv)) return fromEnv;

  for (const key of ["DATABASE_URL", "DIRECT_URL"] as const) {
    const url = process.env[key]?.trim();
    if (!url || PLACEHOLDER.test(url)) continue;
    try {
      const parsed = new URL(url);
      if (parsed.password) return decodeURIComponent(parsed.password);
    } catch {
      /* try next */
    }
  }

  throw new Error(
    "Set SUPABASE_DB_PASSWORD in .env.local (Supabase → Project Settings → Database → Database password). " +
      "Do not leave [YOUR-PASSWORD] in connection strings.",
  );
}

function resolveProjectRef(): string {
  const ref = process.env.SUPABASE_PROJECT_REF?.trim();
  if (ref) return ref;

  for (const key of ["DATABASE_URL", "DIRECT_URL"] as const) {
    const url = process.env[key]?.trim();
    if (!url) continue;
    try {
      const user = new URL(url).username;
      if (user.startsWith("postgres.")) return user.slice("postgres.".length);
    } catch {
      /* continue */
    }
  }

  throw new Error("Missing SUPABASE_PROJECT_REF in .env.local");
}

export function composeDatabaseUrls(): ComposedDatabaseUrls {
  const password = encodeURIComponent(resolvePassword());
  const projectRef = resolveProjectRef();
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST?.trim() ?? "aws-0-eu-central-1.pooler.supabase.com";
  const poolerUser = `postgres.${projectRef}`;

  const databaseUrl =
    `postgresql://${poolerUser}:${password}@${poolerHost}:6543/postgres?pgbouncer=true`;

  const directHost = process.env.SUPABASE_DB_HOST?.trim();
  const directUrl = directHost
    ? `postgresql://postgres:${password}@${directHost}:5432/postgres`
    : `postgresql://${poolerUser}:${password}@${poolerHost}:5432/postgres`;

  return { databaseUrl, directUrl };
}

export function applyDatabaseUrlsToEnv(): ComposedDatabaseUrls {
  const urls = composeDatabaseUrls();
  process.env.DATABASE_URL = urls.databaseUrl;
  process.env.DIRECT_URL = urls.directUrl;
  return urls;
}
