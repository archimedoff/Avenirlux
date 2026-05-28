import Link from "next/link";

import { countNights, formatUsd } from "@/lib/booking-utils";
import { fetchHotelById } from "@/lib/hotels-data";

type ConfirmationPageProps = {
  searchParams: Promise<{
    hotelId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomId?: string;
    ref?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const hotel = params.hotelId
    ? await fetchHotelById(params.hotelId, {
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: Number(params.guests || "2") || 2,
      })
    : null;
  const nights = countNights(params.checkIn || "", params.checkOut || "");
  const room = hotel?.rooms.find((r) => r.id === params.roomId) ?? hotel?.rooms[0];
  const nightly = room?.pricePerNight ?? hotel?.pricePerNight ?? 0;
  const total = nightly * nights + Math.round(nightly * nights * 0.08);

  return (
    <main className="flex min-h-[70vh] items-center justify-center pb-12">
      <section className="glass-card w-full max-w-xl space-y-6 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-xl font-medium text-white">
          ✓
        </div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Reservation confirmed
        </p>
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)]">
          Your stay awaits
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          {params.firstName ? `${params.firstName}, ` : ""}thank you for choosing AvenirLux. A concierge will reach out shortly
          {params.email ? ` at ${params.email}` : ""}.
        </p>

        {hotel && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left text-sm">
            <p className="font-semibold text-[var(--foreground)]">{hotel.name}</p>
            <p className="mt-1 text-[var(--foreground-muted)]">
              {room?.name} · {params.checkIn} → {params.checkOut}
            </p>
            <p className="mt-3 text-[var(--foreground-subtle)]">
              Confirmation · <span className="font-mono text-[var(--foreground)]">{params.ref || "AX-PENDING"}</span>
            </p>
            <p className="mt-2 font-semibold text-[var(--foreground)]">Total {formatUsd(total)}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/hotels" className="btn-primary">
            Explore more stays
          </Link>
          {hotel && (
            <Link href={`/hotel/${hotel.id}`} className="btn-secondary">
              View hotel
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
