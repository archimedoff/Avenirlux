import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  checkPropertyAvailability,
  estimateBookingTotal,
  type MarketplaceBookingRequest,
} from "@/lib/booking/marketplace";
import { bookingRequestsRepository } from "@/lib/db/repositories/booking-requests-repository";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

export async function POST(request: Request) {
  const session = await auth();
  const body = (await request.json()) as MarketplaceBookingRequest;

  if (!body.propertyId || !body.checkIn || !body.checkOut || !body.guestEmail || !body.guestName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const listing = await listingsRepository.findById(body.propertyId);
  if (!listing) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const availability = checkPropertyAvailability(listing, body);
  if (!availability.available) {
    return NextResponse.json({ error: "Unavailable", reason: availability.reason }, { status: 409 });
  }

  const nights = Math.max(
    1,
    Math.round((new Date(body.checkOut).getTime() - new Date(body.checkIn).getTime()) / 86400000),
  );
  const total = estimateBookingTotal(listing, nights, body.roomId);
  const room = body.roomId ? listing.rooms.find((r) => r.id === body.roomId) : listing.rooms[0];

  const record = await bookingRequestsRepository.createRequest({
    propertyId: listing.id,
    hostId: listing.ownerId,
    guestUserId: session?.user?.id,
    guestName: body.guestName,
    guestEmail: body.guestEmail,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    guests: body.guests,
    roomName: room?.name ?? "Residence",
    total,
  });

  return NextResponse.json({ booking: record, instantBooking: availability.instantBooking }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = Number(searchParams.get("guests") || 2);

  if (!propertyId || !checkIn || !checkOut) {
    return NextResponse.json({ error: "propertyId, checkIn, checkOut required" }, { status: 400 });
  }

  const listing = await listingsRepository.findById(propertyId);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const availability = checkPropertyAvailability(listing, { checkIn, checkOut, guests });
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );

  return NextResponse.json({
    availability,
    estimate: estimateBookingTotal(listing, nights),
    nights,
  });
}
