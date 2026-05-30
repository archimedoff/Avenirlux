import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createCheckoutIntent } from "@/lib/booking/checkout-service";
import type { ReservationDraft } from "@/lib/reservation/types";

export async function POST(request: Request) {
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
    console.error("[checkout/intent]", err);
    return NextResponse.json({ error: "Could not initiate checkout" }, { status: 500 });
  }
}
