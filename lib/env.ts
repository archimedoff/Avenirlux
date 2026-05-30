import "server-only";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function isDevelopment(): boolean {
  return !isProduction();
}

export function getSiteEnv(): "development" | "preview" | "production" {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  return "development";
}

/** Fail fast in production when critical secrets are missing. */
export function assertProductionEnv(): void {
  if (!isProduction()) return;
  const missing: string[] = [];
  if (!process.env.AUTH_SECRET?.trim()) missing.push("AUTH_SECRET");
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) missing.push("STRIPE_WEBHOOK_SECRET");
  if (missing.length) {
    throw new Error(`Production missing required env: ${missing.join(", ")}`);
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "concierge@avenirlux.com";
}
