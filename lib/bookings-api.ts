"use client";

import type { ReservationDraft } from "@/lib/reservation/types";

export async function saveAccountBooking(reservation: ReservationDraft, confirmationRef: string) {
  await fetch("/api/account/bookings", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservation, confirmationRef }),
  });
}
