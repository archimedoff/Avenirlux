import { randomUUID } from "crypto";

import { readJson, writeJson } from "@/lib/db/file-store";
import type { BookingStatus, UserBookingRecord } from "@/lib/db/types";
import type { ReservationDraft } from "@/lib/reservation/types";

const FILE = "bookings.json";

export interface BookingRepository {
  listByUser(userId: string): Promise<UserBookingRecord[]>;
  createFromReservation(userId: string, reservation: ReservationDraft, confirmationRef: string): Promise<UserBookingRecord>;
}

function bookingStatus(reservation: ReservationDraft): BookingStatus {
  if (reservation.status === "confirmed") {
    const checkOut = new Date(reservation.checkOut);
    return checkOut < new Date() ? "completed" : "upcoming";
  }
  return "upcoming";
}

export class FileBookingRepository implements BookingRepository {
  private async all(): Promise<UserBookingRecord[]> {
    return readJson<UserBookingRecord[]>(FILE, []);
  }

  private async save(bookings: UserBookingRecord[]) {
    await writeJson(FILE, bookings);
  }

  async listByUser(userId: string) {
    const bookings = await this.all();
    return bookings
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createFromReservation(userId: string, reservation: ReservationDraft, confirmationRef: string) {
    const bookings = await this.all();
    const record: UserBookingRecord = {
      id: randomUUID(),
      userId,
      confirmationRef,
      status: bookingStatus({ ...reservation, status: "confirmed" }),
      hotelId: reservation.hotelId,
      hotelName: reservation.hotelName,
      hotelImage: reservation.hotelImage,
      city: reservation.city,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
      roomName: reservation.roomName,
      total: reservation.pricing.total,
      createdAt: new Date().toISOString(),
    };
    bookings.push(record);
    await this.save(bookings);
    return record;
  }
}

export const bookingRepository: BookingRepository = new FileBookingRepository();
