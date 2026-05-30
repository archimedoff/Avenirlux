import "server-only";

import { generateConfirmationRef } from "@/lib/booking-utils";
import { queueBookingEmail } from "@/lib/booking/email-service";
import { getPlatformHostId } from "@/lib/booking/platform-host";
import { prisma } from "@/lib/db/prisma";
import type { UserBookingRecord } from "@/lib/db/types";
import { pricingToCents } from "@/lib/reservation/pricing";
import type { ReservationDraft } from "@/lib/reservation/types";
import { resolveSelectedUpsells } from "@/lib/reservation/upsells";
import { createPaymentIntent, retrievePaymentIntent, cancelPaymentIntent } from "@/lib/stripe/server";
import { getStripePublishableKey, isStripeConfigured } from "@/lib/stripe/config";

function deriveBookingStatus(checkOut: string): "upcoming" | "completed" {
  return new Date(checkOut) < new Date() ? "completed" : "upcoming";
}

function mapBookingRow(b: {
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
  return {
    id: b.id,
    userId: b.guestUserId ?? "",
    confirmationRef: b.confirmationRef ?? "",
    status: (["upcoming", "completed", "cancelled"].includes(b.status) ? b.status : "upcoming") as UserBookingRecord["status"],
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

async function resolveHostId(reservation: ReservationDraft): Promise<{ hostId: string; propertyId: string | null }> {
  if (reservation.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: reservation.propertyId }, select: { hostId: true, id: true } });
    if (property) return { hostId: property.hostId, propertyId: property.id };
  }
  if (reservation.providerId === "marketplace") {
    const property = await prisma.property.findFirst({
      where: { OR: [{ id: reservation.hotelId }, { slug: reservation.hotelId }] },
      select: { hostId: true, id: true },
    });
    if (property) return { hostId: property.hostId, propertyId: property.id };
  }
  return { hostId: await getPlatformHostId(), propertyId: reservation.propertyId ?? null };
}

export async function createCheckoutIntent(
  reservation: ReservationDraft,
  guestUserId?: string | null,
) {
  if (!reservation.guest) throw new Error("Guest details required");

  const confirmationRef = reservation.confirmationRef ?? generateConfirmationRef();
  const { hostId, propertyId } = await resolveHostId(reservation);
  const upsells = resolveSelectedUpsells(reservation.selectedUpsellIds ?? []);
  const amountCents = pricingToCents(reservation.pricing.total);
  const guestName = `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim();

  const booking = await prisma.booking.create({
    data: {
      kind: "guest_booking",
      status: "pending_payment",
      hostId,
      propertyId,
      guestUserId: guestUserId ?? null,
      guestName,
      guestEmail: reservation.guest.email,
      guestPhone: reservation.guest.phone,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
      roomName: reservation.roomName,
      roomId: reservation.roomId,
      total: reservation.pricing.total,
      specialRequests: reservation.guest.specialRequests ?? null,
      arrivalTime: reservation.guest.arrivalTime ?? null,
      conciergeNotes: reservation.guest.conciergeNotes ?? null,
      upsellsJson: upsells as unknown as object,
      providerId: reservation.providerId ?? null,
      pricingJson: reservation.pricing as unknown as object,
      confirmationRef,
      externalHotelId: reservation.hotelId,
      hotelName: reservation.hotelName,
      hotelImage: reservation.hotelImage,
      city: reservation.city,
      country: reservation.country ?? null,
      payment: {
        create: {
          amountCents,
          currency: "usd",
          status: "pending",
        },
      },
    },
    include: { payment: true },
  });

  const mockMode = !isStripeConfigured();
  let clientSecret: string | null = null;
  let paymentIntentId: string | null = null;

  if (!mockMode) {
    const intent = await createPaymentIntent({
      amountCents,
      metadata: {
        bookingId: booking.id,
        confirmationRef,
        hotelId: reservation.hotelId,
      },
      receiptEmail: reservation.guest.email,
      description: `${reservation.hotelName} · ${confirmationRef}`,
    });
    if (!intent) throw new Error("Failed to create payment intent");
    clientSecret = intent.client_secret;
    paymentIntentId = intent.id;
    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: { stripePaymentIntentId: intent.id, status: "processing" },
    });
  }

  return {
    clientSecret,
    bookingId: booking.id,
    confirmationRef,
    paymentIntentId,
    mockMode,
    publishableKey: getStripePublishableKey(),
  };
}

export async function confirmCheckoutPayment(bookingId: string, paymentIntentId?: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "upcoming" || booking.status === "confirmed") {
    return { success: true, confirmationRef: booking.confirmationRef ?? "", bookingId, status: booking.status };
  }

  const mockMode = !isStripeConfigured();
  if (!mockMode) {
    const intentId = paymentIntentId ?? booking.payment?.stripePaymentIntentId;
    if (!intentId) throw new Error("Missing payment intent");
    const intent = await retrievePaymentIntent(intentId);
    if (!intent || intent.status !== "succeeded") {
      await prisma.payment.update({ where: { bookingId }, data: { status: "failed" } });
      await prisma.booking.update({ where: { id: bookingId }, data: { status: "pending_payment" } });
      return { success: false, confirmationRef: booking.confirmationRef ?? "", bookingId, status: "failed", error: "Payment not completed" };
    }
    await prisma.payment.update({
      where: { bookingId },
      data: { status: "succeeded", paymentMethod: intent.payment_method_types?.[0] ?? "card" },
    });
  } else if (booking.payment) {
    await prisma.payment.update({ where: { bookingId }, data: { status: "succeeded", paymentMethod: "mock" } });
  }

  const nextStatus = deriveBookingStatus(booking.checkOut);
  await prisma.booking.update({ where: { id: bookingId }, data: { status: nextStatus } });

  await queueBookingEmail(
    "booking_confirmation",
    {
      confirmationRef: booking.confirmationRef ?? "",
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hotelName: booking.hotelName ?? "Your stay",
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      total: booking.total,
      city: booking.city ?? undefined,
    },
    bookingId,
  );

  return { success: true, confirmationRef: booking.confirmationRef ?? "", bookingId, status: nextStatus };
}

export async function cancelGuestBooking(bookingId: string, userId: string, reason?: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, guestUserId: userId, kind: "guest_booking" },
    include: { payment: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "cancelled") return mapBookingRow(booking);

  if (booking.payment?.stripePaymentIntentId && booking.payment.status === "succeeded") {
    // Future: Stripe refund API
  } else if (booking.payment?.stripePaymentIntentId && booking.payment.status === "processing") {
    await cancelPaymentIntent(booking.payment.stripePaymentIntentId);
    await prisma.payment.update({ where: { bookingId }, data: { status: "cancelled" } });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled", cancelledAt: new Date(), cancellationReason: reason ?? null },
  });

  await queueBookingEmail(
    "booking_cancelled",
    {
      confirmationRef: booking.confirmationRef ?? "",
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hotelName: booking.hotelName ?? "Your stay",
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      total: booking.total,
      city: booking.city ?? undefined,
    },
    bookingId,
  );

  return mapBookingRow(updated);
}

export async function getGuestBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, guestUserId: userId, kind: "guest_booking" },
    include: { payment: true },
  });
  if (!booking) return null;
  return {
    ...mapBookingRow(booking),
    paymentStatus: booking.payment?.status ?? null,
    upsells: booking.upsellsJson,
    pricing: booking.pricingJson,
    specialRequests: booking.specialRequests,
    arrivalTime: booking.arrivalTime,
    conciergeNotes: booking.conciergeNotes,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    cancellationReason: booking.cancellationReason,
  };
}

export async function handleStripeWebhookEvent(event: { type: string; data: { object: { id?: string; metadata?: Record<string, string>; status?: string } } }) {
  if (event.type === "payment_intent.succeeded") {
    const bookingId = event.data.object.metadata?.bookingId;
    if (bookingId) await confirmCheckoutPayment(bookingId, event.data.object.id);
  }
  if (event.type === "payment_intent.payment_failed") {
    const bookingId = event.data.object.metadata?.bookingId;
    if (bookingId) {
      await prisma.payment.updateMany({ where: { bookingId }, data: { status: "failed" } });
    }
  }
}
