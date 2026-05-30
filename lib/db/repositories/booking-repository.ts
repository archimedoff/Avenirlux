import type { BookingStatus, UserBookingRecord } from "@/lib/db/types";
import type { ReservationDraft } from "@/lib/reservation/types";
import { PrismaBookingRepository } from "@/lib/db/repositories/prisma/booking-repository";

export interface BookingRepository {
  listByUser(userId: string): Promise<UserBookingRecord[]>;
  createFromReservation(
    userId: string,
    reservation: ReservationDraft,
    confirmationRef: string,
  ): Promise<UserBookingRecord>;
  getById(userId: string, bookingId: string): Promise<UserBookingRecord | null>;
  cancel(userId: string, bookingId: string, reason?: string): Promise<UserBookingRecord>;
}

export const bookingRepository: BookingRepository = new PrismaBookingRepository();
