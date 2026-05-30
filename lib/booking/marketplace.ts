import type { HostListingRecord } from "@/lib/db/types";

export type MarketplaceBookingRequest = {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId?: string;
  guestName: string;
  guestEmail: string;
};

export type BookingAvailability = {
  available: boolean;
  reason?: "unpublished" | "blocked_dates" | "min_nights" | "no_rooms";
  minNights: number;
  instantBooking: boolean;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function datesOverlap(checkIn: string, checkOut: string, blocked: string[]): boolean {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return blocked.some((d) => {
    const day = new Date(d);
    return day >= start && day < end;
  });
}

export function checkPropertyAvailability(
  listing: HostListingRecord,
  req: Pick<MarketplaceBookingRequest, "checkIn" | "checkOut" | "guests">,
): BookingAvailability {
  if (listing.status !== "published") {
    return { available: false, reason: "unpublished", minNights: 1, instantBooking: false };
  }

  const minNights = listing.metadata?.minNights ?? 1;
  const nights = nightsBetween(req.checkIn, req.checkOut);
  if (nights < minNights) {
    return { available: false, reason: "min_nights", minNights, instantBooking: listing.metadata?.instantBooking ?? false };
  }

  const blocked = listing.metadata?.unavailableDates ?? [];
  if (datesOverlap(req.checkIn, req.checkOut, blocked)) {
    return { available: false, reason: "blocked_dates", minNights, instantBooking: listing.metadata?.instantBooking ?? false };
  }

  const capacity = listing.metadata?.guestCapacity ?? listing.rooms[0]?.maxGuests ?? 2;
  if (req.guests > capacity) {
    return { available: false, reason: "no_rooms", minNights, instantBooking: listing.metadata?.instantBooking ?? false };
  }

  return { available: true, minNights, instantBooking: listing.metadata?.instantBooking ?? false };
}

export function estimateBookingTotal(listing: HostListingRecord, nights: number, roomId?: string): number {
  const room = roomId ? listing.rooms.find((r) => r.id === roomId) : listing.rooms[0];
  const nightly = room?.pricePerNight ?? listing.pricePerNight;
  const cleaning = listing.metadata?.cleaningFee ?? 0;
  return nightly * nights + cleaning;
}
