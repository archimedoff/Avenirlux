import type { BookingRepository } from "@/lib/db/repositories/booking-repository";
import type { BookingStatus, UserBookingRecord } from "@/lib/db/types";
import { cancelGuestBooking } from "@/lib/booking/checkout-service";
import { prisma } from "@/lib/db/prisma";
import type { ReservationDraft } from "@/lib/reservation/types";

function mapRow(b: {
  id: string;
  guestUserId: string | null;
  confirmationRef: string | null;
  status: string;
  externalHotelId: string | null;
  propertyId: string | null;
  hotelName: string | null;
  hotelImage: string | null;
  city: string | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomName: string;
  total: number;
  createdAt: Date;
}): UserBookingRecord {
  const status = (["upcoming", "completed", "cancelled"].includes(b.status)
    ? b.status
    : b.status === "confirmed"
      ? "upcoming"
      : "upcoming") as BookingStatus;
  return {
    id: b.id,
    userId: b.guestUserId ?? "",
    confirmationRef: b.confirmationRef ?? "",
    status,
    hotelId: b.externalHotelId ?? b.propertyId ?? "",
    hotelName: b.hotelName ?? "",
    hotelImage: b.hotelImage ?? "",
    city: b.city ?? "",
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    roomName: b.roomName,
    total: b.total,
    createdAt: b.createdAt.toISOString(),
  };
}

export class PrismaBookingRepository implements BookingRepository {
  async listByUser(userId: string) {
    const rows = await prisma.booking.findMany({
      where: { guestUserId: userId, kind: "guest_booking", status: { notIn: ["pending_payment", "pending"] } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapRow);
  }

  async createFromReservation(userId: string, reservation: ReservationDraft, confirmationRef: string) {
    const guestName = reservation.guest
      ? `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim()
      : "Guest";
    const row = await prisma.booking.create({
      data: {
        kind: "guest_booking",
        status: new Date(reservation.checkOut) < new Date() ? "completed" : "upcoming",
        guestUserId: userId,
        hostId: userId,
        guestName,
        guestEmail: reservation.guest?.email ?? "",
        guestPhone: reservation.guest?.phone ?? null,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        roomName: reservation.roomName,
        roomId: reservation.roomId,
        total: reservation.pricing.total,
        confirmationRef,
        externalHotelId: reservation.hotelId,
        hotelName: reservation.hotelName,
        hotelImage: reservation.hotelImage,
        city: reservation.city,
        country: reservation.country ?? null,
        providerId: reservation.providerId ?? null,
        pricingJson: reservation.pricing as object,
      },
    });
    return mapRow({ ...row, guestUserId: userId });
  }

  async getById(userId: string, bookingId: string) {
    const row = await prisma.booking.findFirst({
      where: { id: bookingId, guestUserId: userId, kind: "guest_booking" },
    });
    return row ? mapRow(row) : null;
  }

  async cancel(userId: string, bookingId: string, reason?: string) {
    return cancelGuestBooking(bookingId, userId, reason);
  }
}
