import type { ReservationDraft } from "@/lib/reservation/types";

export async function saveAccountBooking(reservation: ReservationDraft, confirmationRef: string) {
  const res = await fetch("/api/account/bookings", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservation, confirmationRef }),
  });
  if (!res.ok) throw new Error("Failed to save booking");
  return res.json();
}

export async function createCheckoutIntent(reservation: ReservationDraft) {
  const res = await fetch("/api/checkout/intent", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservation }),
  });
  if (!res.ok) throw new Error("Could not initiate payment");
  return res.json();
}

export async function confirmCheckout(bookingId: string, paymentIntentId?: string) {
  const res = await fetch("/api/checkout/confirm", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, paymentIntentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Payment confirmation failed");
  return data;
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const res = await fetch(`/api/account/bookings/${bookingId}/cancel`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Cancellation failed");
  return res.json();
}
