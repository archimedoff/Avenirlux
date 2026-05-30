/** Stripe configuration — publishable key is safe for client; secret stays server-only. */

import { isProduction } from "@/lib/env";

export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && getStripePublishableKey());
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

/** In production, mock payments are never allowed. */
export function allowMockPayments(): boolean {
  if (isProduction()) return false;
  return !isStripeConfigured();
}
