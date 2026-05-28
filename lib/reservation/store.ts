import type { GuestDetails, ReservationDraft, ReservationStatus } from "@/lib/reservation/types";
import type { PricingBreakdown } from "@/lib/reservation/pricing";

const STORAGE_KEY = "avenirlux_reservation_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadReservation(): ReservationDraft | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReservationDraft;
  } catch {
    return null;
  }
}

export function saveReservation(draft: ReservationDraft): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
}

export function clearReservation(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function updateReservationStatus(status: ReservationStatus, extra?: Partial<ReservationDraft>): ReservationDraft | null {
  const current = loadReservation();
  if (!current) return null;
  const next = { ...current, ...extra, status, updatedAt: new Date().toISOString() };
  saveReservation(next);
  return next;
}

export function buildDraftFromStay(params: {
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  city: string;
  country?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId: string;
  roomName: string;
  pricing: PricingBreakdown;
}): ReservationDraft {
  return {
    ...params,
    status: "draft",
    updatedAt: new Date().toISOString(),
  };
}

export function mergeGuestDetails(guest: GuestDetails): ReservationDraft | null {
  const current = loadReservation();
  if (!current) return null;
  const next = { ...current, guest, status: "checkout" as const, updatedAt: new Date().toISOString() };
  saveReservation(next);
  return next;
}
