/** True when a real Supabase/Postgres URL is configured (not local placeholders). */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url.startsWith("postgres")) return false;
  if (url.includes("placeholder")) return false;
  if (/localhost:5432\/mydb/.test(url)) return false;
  if (url.includes("johndoe:randompassword")) return false;
  return true;
}

export function requireDatabase(): void {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is required (Supabase PostgreSQL). Add it to .env.local — see lib/db/SUPABASE.md",
    );
  }
}
