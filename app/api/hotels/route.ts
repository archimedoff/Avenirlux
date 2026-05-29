import { NextRequest, NextResponse } from "next/server";

import { fetchHotels } from "@/lib/hotels-service";
import { parseAmenitiesParam } from "@/lib/hotels-filter";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const result = await fetchHotels({
    city: params.get("city") || undefined,
    checkIn: params.get("checkIn") || undefined,
    checkOut: params.get("checkOut") || undefined,
    guests: Number(params.get("guests") || "2") || 2,
    offset: Number(params.get("offset") || "0") || 0,
    limit: Number(params.get("limit") || "20") || 20,
    propertyType: params.get("propertyType") || undefined,
    amenities: parseAmenitiesParam(params.get("amenities") ?? undefined),
  });

  if (result.error && !result.hotels.length) {
    return NextResponse.json({ hotels: [], hasMore: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json(result);
}
