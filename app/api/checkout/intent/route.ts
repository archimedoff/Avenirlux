import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCheckoutIntent, ReservationValidationError } from "@/lib/booking/checkout-service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import type { ReservationDraft } from "@/lib/reservation/types";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`checkout:intent:${ip}`, 20);
  if (!limit.allowed) return rateLimitResponse(limit);

  try {
    const session = await auth();
    const body = await request.json();
    const reservation = body.reservation as ReservationDraft | undefined;
    if (!reservation?.guest || !reservation.pricing) {
      return NextResponse.json({ error: "Invalid reservation payload" }, { status: 400 });
    }
    const result = await createCheckoutIntent(reservation, session?.user?.id ?? null);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ReservationValidationError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    console.error("[checkout/intent]", err);
    return NextResponse.json({ error: "Could not initiate checkout" }, { status: 500 });
  }
}
