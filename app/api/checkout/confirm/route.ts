import { NextResponse } from "next/server";

import { confirmCheckoutPayment } from "@/lib/booking/checkout-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
    const paymentIntentId = typeof body.paymentIntentId === "string" ? body.paymentIntentId : undefined;
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });
    const result = await confirmCheckoutPayment(bookingId, paymentIntentId);
    if (!result.success) return NextResponse.json(result, { status: 402 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[checkout/confirm]", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
