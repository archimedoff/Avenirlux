import type { BookingRepository } from "@/lib/db/repositories/booking-repository";
import type { BookingStatus, UserBookingRecord } from "@/lib/db/types";
import type { ReservationDraft } from "@/lib/reservation/types";
import { prisma } from "@/lib/db/prisma";

function bookingStatus(reservation: ReservationDraft): BookingStatus {
  if (reservation.status === "confirmed") {
    const checkOut = new Date(reservation.checkOut);
    return checkOut < new Date() ? "completed" : "upcoming";
  }
  return "upcoming";
}

export class PrismaBookingRepository implements BookingRepository {
  async listByUser(userId: string) {
    const rows = await prisma.booking.findMany({
      where: { guestUserId: userId, kind: "guest_booking" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(
      (b): UserBookingRecord => ({
        id: b.id,
        userId: b.guestUserId!,
        confirmationRef: b.confirmationRef ?? "",
        status: b.status as BookingStatus,
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
      })
    );
  }

  async createFromReservation(userId: string, reservation: ReservationDraft, confirmationRef: string) {
    const row = await prisma.booking.create({
      data: {
        kind: "guest_booking",
        status: bookingStatus({ ...reservation, status: "confirmed" }),
        guestUserId: userId,
        hostId: userId,
        guestName: reservation.guest ? ` `.trim() : "Guest",
        guestEmail: reservation.guest?.email ?? "",
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        roomName: reservation.roomName,
        total: reservation.pricing.total,
        confirmationRef,
        externalHotelId: reservation.hotelId,
        hotelName: reservation.hotelName,
        hotelImage: reservation.hotelImage,
        city: reservation.city,
      },
    });
    return {
      id: row.id,
      userId,
      confirmationRef,
      status: row.status as BookingStatus,
      hotelId: row.externalHotelId ?? "",
      hotelName: row.hotelName ?? "",
      hotelImage: row.hotelImage ?? "",
      city: row.city ?? "",
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      guests: row.guests,
      roomName: row.roomName,
      total: row.total,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
