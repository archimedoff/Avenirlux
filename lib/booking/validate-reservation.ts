import "server-only";

import { countNights } from "@/lib/booking-utils";
import { fetchHotelById } from "@/lib/hotels-data";
import { prisma } from "@/lib/db/prisma";
import { calculateStayPricing, type PricingBreakdown } from "@/lib/reservation/pricing";
import type { ReservationDraft } from "@/lib/reservation/types";
import { resolveSelectedUpsells } from "@/lib/reservation/upsells";

const PRICE_TOLERANCE = 1.0;

export class ReservationValidationError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function validateGuest(guest: ReservationDraft["guest"]) {
  if (!guest) throw new ReservationValidationError("GUEST_REQUIRED", "Guest details required");
  if (!guest.firstName?.trim() || !guest.lastName?.trim()) {
    throw new ReservationValidationError("GUEST_NAME", "Guest name required");
  }
  if (!guest.email?.includes("@")) throw new ReservationValidationError("GUEST_EMAIL", "Valid email required");
  if (guest.phone && guest.phone.length > 32) throw new ReservationValidationError("GUEST_PHONE", "Phone too long");
}

function validateDates(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) throw new ReservationValidationError("DATES", "Check-in and check-out required");
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    throw new ReservationValidationError("DATES", "Invalid dates");
  }
  if (outDate <= inDate) throw new ReservationValidationError("DATES", "Check-out must be after check-in");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inDate < today) throw new ReservationValidationError("DATES", "Check-in cannot be in the past");
  const nights = countNights(checkIn, checkOut);
  if (nights > 30) throw new ReservationValidationError("DATES", "Maximum stay is 30 nights");
}

async function checkDoubleBooking(reservation: ReservationDraft) {
  if (!reservation.propertyId) return;
  const conflict = await prisma.booking.findFirst({
    where: {
      propertyId: reservation.propertyId,
      kind: { in: ["guest_booking", "host_request"] },
      status: { in: ["pending_payment", "upcoming", "confirmed", "pending"] },
      checkIn: { lt: reservation.checkOut },
      checkOut: { gt: reservation.checkIn },
      ...(reservation.roomId ? { roomId: reservation.roomId } : {}),
    },
    select: { id: true },
  });
  if (conflict) throw new ReservationValidationError("UNAVAILABLE", "These dates are no longer available");
}

export async function validateAndPriceReservation(
  reservation: ReservationDraft,
): Promise<{ pricing: PricingBreakdown; reservation: ReservationDraft }> {
  validateGuest(reservation.guest);
  validateDates(reservation.checkIn, reservation.checkOut);

  if (!reservation.hotelId) throw new ReservationValidationError("HOTEL", "Hotel required");
  if (reservation.guests < 1 || reservation.guests > 12) {
    throw new ReservationValidationError("GUESTS", "Guest count must be 1–12");
  }

  const hotel = await fetchHotelById(reservation.hotelId, {
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
  });
  if (!hotel) throw new ReservationValidationError("HOTEL", "Hotel not found");

  const room = hotel.rooms.find((r) => r.id === reservation.roomId) ?? hotel.rooms[0];
  const nightly = room?.pricePerNight ?? hotel.pricePerNight;
  if (!nightly || nightly <= 0) throw new ReservationValidationError("PRICING", "Could not determine room rate");

  const nights = countNights(reservation.checkIn, reservation.checkOut);
  const upsells = resolveSelectedUpsells(reservation.selectedUpsellIds ?? []);
  const pricing = calculateStayPricing(nightly, nights, upsells);

  const clientTotal = reservation.pricing?.total ?? 0;
  if (Math.abs(clientTotal - pricing.total) > PRICE_TOLERANCE) {
    throw new ReservationValidationError("PRICE_MISMATCH", "Pricing changed — please review your reservation");
  }

  await checkDoubleBooking({ ...reservation, propertyId: reservation.propertyId ?? hotel.id });

  return {
    pricing,
    reservation: {
      ...reservation,
      hotelName: hotel.name,
      hotelImage: hotel.image,
      city: hotel.city,
      country: hotel.country,
      roomName: room?.name ?? reservation.roomName,
      roomId: room?.id ?? reservation.roomId,
      pricing,
    },
  };
}
