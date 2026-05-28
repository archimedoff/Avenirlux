import Link from "next/link";

import { ReserveReview } from "@/components/reserve-review";
import { ReservationProgress } from "@/components/reservation-progress";
import { defaultCheckIn, defaultCheckOut } from "@/lib/booking-utils";
import { fetchHotelById } from "@/lib/hotels-data";

type ReservePageProps = {
  searchParams: Promise<{
    hotelId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomId?: string;
    city?: string;
  }>;
};

export default async function ReservePage({ searchParams }: ReservePageProps) {
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
    <main className="space-y-8 pb-8 sm:space-y-10">
      <section className="glass-card p-8 sm:p-10">
        <ReservationProgress current="reserve" />
        <h1 className="font-display mt-4 text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
          Review your stay
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          Confirm dates, suite selection, and pricing before guest details.
        </p>
      </section>
      {!hotel ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center">
          <p className="text-lg font-semibold">Select a residence to continue</p>
          <Link href="/hotels" className="btn-primary mt-6 inline-flex">
            Browse stays
          </Link>
        </section>
      ) : (
        <ReserveReview hotel={hotel} checkIn={checkIn} checkOut={checkOut} guests={guests} roomId={params.roomId} />
      )}
    </main>
  );
}
