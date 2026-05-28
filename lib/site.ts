export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
