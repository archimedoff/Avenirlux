import { NextRequest, NextResponse } from "next/server";

import { fetchLiteApiHotels } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const city = searchParams.get("city") ?? undefined;
  const checkIn = searchParams.get("checkIn") ?? undefined;
  const checkOut = searchParams.get("checkOut") ?? undefined;
  const guestsParam = searchParams.get("guests");
  const id = searchParams.get("id") ?? undefined;

  const guests = guestsParam ? Number(guestsParam) : undefined;

  try {
    const hotels = await fetchLiteApiHotels({
      id,
      city,
      checkIn,
      checkOut,
      guests: Number.isFinite(guests) ? guests : undefined,
    });

    return NextResponse.json({ hotels });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch hotels.";
    console.error("/api/hotels failed", {
      city,
      checkIn,
      checkOut,
      guests,
      id,
      message,
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
