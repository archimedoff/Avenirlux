import type { BookingRequestRecord } from "@/lib/db/types";
import { PrismaBookingRequestsRepository } from "@/lib/db/repositories/prisma/booking-requests-repository";

export type BookingRequestsRepository = PrismaBookingRequestsRepository;

export const bookingRequestsRepository = new PrismaBookingRequestsRepository();
