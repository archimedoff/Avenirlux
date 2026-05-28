import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { bookingRepository } from "@/lib/db/repositories/booking-repository";
import type { ReservationDraft } from "@/lib/reservation/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await bookingRepository.listByUser(session.user.id);
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const reservation = body.reservation as ReservationDraft | undefined;
  const confirmationRef = typeof body.confirmationRef === "string" ? body.confirmationRef : "";
  if (!reservation || !confirmationRef) {
    return NextResponse.json({ error: "Invalid booking payload" }, { status: 400 });
  }
  const booking = await bookingRepository.createFromReservation(session.user.id, reservation, confirmationRef);
  return NextResponse.json({ booking }, { status: 201 });
}
