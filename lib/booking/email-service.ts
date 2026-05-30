import "server-only";

import { prisma } from "@/lib/db/prisma";
import { renderBookingEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { logger } from "@/lib/logger";

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
  hostEmail?: string;
};

const subjects: Record<BookingEmailTemplate, (p: BookingEmailPayload) => string> = {
  booking_confirmation: (p) => `Your AvenirLux stay is confirmed · ${p.confirmationRef}`,
  booking_cancelled: (p) => `Reservation cancelled · ${p.confirmationRef}`,
  host_new_booking: (p) => `New reservation · ${p.confirmationRef}`,
};

export async function queueBookingEmail(
  template: BookingEmailTemplate,
  payload: BookingEmailPayload,
  bookingId?: string,
): Promise<{ queued: boolean; sent: boolean; id?: string }> {
  const subject = subjects[template](payload);
  const html = renderBookingEmail(template, payload);
  const toEmail = template === "host_new_booking" ? payload.hostEmail ?? payload.guestEmail : payload.guestEmail;

  const record = await prisma.emailNotification.create({
    data: {
      bookingId: bookingId ?? null,
      toEmail,
      template,
      subject,
      status: "queued",
      payload: payload as object,
    },
  });

  const result = await sendEmail({ to: toEmail, subject, html });
  if (result.sent) {
    await prisma.emailNotification.update({
      where: { id: record.id },
      data: { status: "sent", sentAt: new Date() },
    });
    return { queued: true, sent: true, id: record.id };
  }

  logger.warn("email.queued_only", { template, to: toEmail, reason: result.error });
  return { queued: true, sent: false, id: record.id };
}
