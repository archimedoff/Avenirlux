/** True when a real Supabase/Postgres URL is configured (not local placeholders). */
const PLACEHOLDER = /\[YOUR-PASSWORD\]/i;

export function isDatabaseConfigured(): boolean {
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (password && !PLACEHOLDER.test(password)) return true;

  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url.startsWith("postgres")) return false;
  if (PLACEHOLDER.test(url)) return false;
  if (url.includes("placeholder")) return false;
  if (/localhost:5432\/mydb/.test(url)) return false;
  if (url.includes("johndoe:randompassword")) return false;
  return true;
}

export function requireDatabase(): void {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Supabase Postgres is not configured. Set SUPABASE_DB_PASSWORD (and SUPABASE_PROJECT_REF) in .env.local — see lib/db/SUPABASE.md",
    );
  }
}
