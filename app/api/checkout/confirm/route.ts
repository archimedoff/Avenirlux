import { NextResponse } from "next/server";

import { confirmCheckoutPayment } from "@/lib/booking/checkout-service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`checkout:confirm:${ip}`, 30);
  if (!limit.allowed) return rateLimitResponse(limit);

  try {
    const body = await request.json();
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
    const paymentIntentId = typeof body.paymentIntentId === "string" ? body.paymentIntentId : undefined;
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const expectedIntent = paymentIntentId ?? booking.payment?.stripePaymentIntentId;
    if (expectedIntent && booking.payment?.stripePaymentIntentId && expectedIntent !== booking.payment.stripePaymentIntentId) {
      return NextResponse.json({ error: "Payment intent mismatch" }, { status: 403 });
    }

    const result = await confirmCheckoutPayment(bookingId, expectedIntent ?? undefined);
    if (!result.success) return NextResponse.json(result, { status: 402 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[checkout/confirm]", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
