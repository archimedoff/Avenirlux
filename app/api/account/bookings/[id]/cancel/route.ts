import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { bookingRepository } from "@/lib/db/repositories/booking-repository";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason : undefined;
  try {
    const booking = await bookingRepository.cancel(session.user.id, id, reason);
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Could not cancel booking" }, { status: 400 });
  }
}
