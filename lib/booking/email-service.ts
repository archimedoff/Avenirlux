import "server-only";

import { prisma } from "@/lib/db/prisma";

export type BookingEmailTemplate = "booking_confirmation" | "booking_cancelled" | "host_new_booking";

export type BookingEmailPayload = {
  confirmationRef: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  total: number;
  city?: string;
};

/** Email delivery architecture — queue records now; wire Resend/SendGrid/Postmark later. */
export async function queueBookingEmail(
  template: BookingEmailTemplate,
  payload: BookingEmailPayload,
  bookingId?: string,
): Promise<{ queued: boolean; id?: string }> {
  const subjects: Record<BookingEmailTemplate, string> = {
    booking_confirmation: `Your AvenirLux stay is confirmed · ${payload.confirmationRef}`,
    booking_cancelled: `Reservation cancelled · ${payload.confirmationRef}`,
    host_new_booking: `New reservation · ${payload.confirmationRef}`,
  };

  const record = await prisma.emailNotification.create({
    data: {
      bookingId: bookingId ?? null,
      toEmail: payload.guestEmail,
      template,
      subject: subjects[template],
      status: "queued",
      payload: payload as object,
    },
  });

  if (process.env.NODE_ENV === "development") {
    console.info(`[email] queued ${template} → ${payload.guestEmail} (${record.id})`);
  }

  return { queued: true, id: record.id };
}
