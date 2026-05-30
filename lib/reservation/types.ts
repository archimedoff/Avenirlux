import type { PricingBreakdown } from "@/lib/reservation/pricing";

export type ReservationStatus = "draft" | "checkout" | "payment" | "confirmed" | "failed";

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
  providerId?: string;
  propertyId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId: string;
  roomName: string;
  pricing: PricingBreakdown;
  selectedUpsellIds?: string[];
  guest?: GuestDetails;
  confirmationRef?: string;
  bookingId?: string;
  paymentIntentId?: string;
  status: ReservationStatus;
  updatedAt: string;
};

export type PaymentIntentPayload = {
  reservation: ReservationDraft;
  amountCents: number;
  currency: string;
};

export type CheckoutIntentResponse = {
  clientSecret: string | null;
  bookingId: string;
  confirmationRef: string;
  paymentIntentId: string | null;
  mockMode: boolean;
  publishableKey: string | null;
};

export type CheckoutConfirmResponse = {
  success: boolean;
  confirmationRef: string;
  bookingId: string;
  status: string;
  error?: string;
};
