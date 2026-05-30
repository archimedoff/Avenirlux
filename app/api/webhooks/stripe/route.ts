import { NextResponse } from "next/server";
import Stripe from "stripe";

import { handleStripeWebhookEvent } from "@/lib/booking/checkout-service";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await handleStripeWebhookEvent(event as unknown as { type: string; data: { object: { id?: string; metadata?: Record<string, string>; status?: string } } });
  return NextResponse.json({ received: true });
}
