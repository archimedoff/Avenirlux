"use client";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import type { Hotel } from "@/lib/hotel-types";

type BookingCheckoutProps = {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId?: string;
};

export function BookingCheckout(props: BookingCheckoutProps) {
  return <CheckoutFlow {...props} />;
}
