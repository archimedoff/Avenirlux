/** True when Supabase/Postgres connection is configured. */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && !url.includes("placeholder") && url.startsWith("postgres"));
}
