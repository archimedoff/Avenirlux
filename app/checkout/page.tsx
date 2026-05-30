import Link from "next/link";

import { BookingCheckout } from "@/components/booking-checkout";
import { defaultCheckIn, defaultCheckOut } from "@/lib/booking-utils";
import { fetchHotelById } from "@/lib/hotels-data";

type CheckoutPageProps = {
  searchParams: Promise<{
    hotelId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomId?: string;
    city?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const hotel = params.hotelId
    ? await fetchHotelById(params.hotelId, {
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: Number(params.guests || "2") || 2,
        city: params.city,
      })
    : null;
  const checkIn = params.checkIn || defaultCheckIn();
  const checkOut = params.checkOut || defaultCheckOut();
  const guests = Number(params.guests || "2") || 2;

  return (
    <main className="page-enter space-y-8 pb-12 sm:space-y-10">
      <section className="glass-card p-8 sm:p-10">
        <p className="eyebrow eyebrow-gold">Secure checkout</p>
        <h1 className="font-display mt-4 text-3xl font-light tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
          Complete your reservation
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          A seamless three-step experience — guest details, concierge enhancements, and secure payment.
        </p>
      </section>
      {!hotel ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-12 text-center">
          <p className="font-display text-xl font-light">Select a residence to continue</p>
          <Link href="/hotels" className="btn-primary mt-6 inline-flex">Browse stays</Link>
        </section>
      ) : (
        <BookingCheckout hotel={hotel} checkIn={checkIn} checkOut={checkOut} guests={guests} roomId={params.roomId} />
      )}
    </main>
  );
}
