import type { PricingBreakdown } from "@/lib/reservation/pricing";

export type ReservationStatus = "draft" | "checkout" | "confirmed";

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests?: string;
  arrivalTime?: string;
  conciergeNotes?: string;
};

export type ReservationDraft = {
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
  guest?: GuestDetails;
  confirmationRef?: string;
  status: ReservationStatus;
  updatedAt: string;
};

export type PaymentIntentPayload = {
  reservation: ReservationDraft;
  amountCents: number;
  currency: string;
};
