import "server-only";

import Stripe from "stripe";

import { isStripeConfigured } from "@/lib/stripe/config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export type CreatePaymentIntentInput = {
  amountCents: number;
  currency?: string;
  metadata: Record<string, string>;
  receiptEmail?: string;
  description?: string;
};

export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  const stripe = getStripe();
  if (!stripe) return null;

  return stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: (input.currency ?? "usd").toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: input.metadata,
    receipt_email: input.receiptEmail,
    description: input.description,
  });
}

export async function retrievePaymentIntent(intentId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  return stripe.paymentIntents.retrieve(intentId);
}

export async function cancelPaymentIntent(intentId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  return stripe.paymentIntents.cancel(intentId);
}


export async function createRefund(paymentIntentId: string, amountCents?: number) {
  const stripe = getStripe();
  if (!stripe) return null;
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  });
}
