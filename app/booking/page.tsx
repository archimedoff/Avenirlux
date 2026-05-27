import Link from "next/link";

import { buildBookingComUrl } from "@/lib/checkout";
import { fetchLiteApiHotelById, fetchLiteApiHotelPrice } from "@/lib/liteapi";

type BookingPageProps = {
  searchParams: Promise<{
    hotelId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;

  const hotelId = params.hotelId || "";
  const checkIn = params.checkIn || "";
  const checkOut = params.checkOut || "";
  const guests = Number(params.guests || "2") || 2;

  const hotel = hotelId ? await fetchLiteApiHotelById(hotelId) : null;

  let nightlyPrice: number | null = null;
  if (hotel && checkIn && checkOut) {
    try {
      nightlyPrice = await fetchLiteApiHotelPrice({
        hotelId: hotel.id,
        countryCode: hotel.country,
        checkIn,
        checkOut,
        guests,
      });
    } catch (error) {
      console.error("Booking page price fetch failed", {
        hotelId,
        checkIn,
        checkOut,
        guests,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const totalPrice = nightlyPrice ? nightlyPrice * nights : null;

  const cityForBooking = hotel ? [hotel.city, hotel.country].filter(Boolean).join(", ") : "";
  const hasBookingData = Boolean(cityForBooking && checkIn && checkOut && guests > 0);
  const externalCheckoutUrl = hasBookingData
    ? buildBookingComUrl({
        city: cityForBooking,
        checkIn,
        checkOut,
        guests,
      })
    : null;


  return (
    <main className="space-y-8 pb-8 sm:space-y-10">
      <section className="glass-card p-8 sm:p-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Secure booking
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
          Complete your reservation
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          Review your stay and pricing before you continue to checkout.
        </p>
      </section>

      {!hotel ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-sm)]">
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">Hotel not found for booking.</p>
          <Link href="/hotels" className="btn-ghost mt-6 inline-flex">
            ← Back to hotels
          </Link>
        </section>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          <article className="glass-card space-y-5 p-6 sm:p-8">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-sm)]">
              <div className="aspect-[16/10] w-full">
                <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl">{hotel.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
                {hotel.location}, {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 4).map((amenity) => (
                <span key={amenity} className="badge">
                  {amenity}
                </span>
              ))}
            </div>
          </article>

          <aside className="glass-card h-fit space-y-5 p-6 sm:p-8">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">Price summary</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {checkIn || "—"} → {checkOut || "—"} · {guests} guest{guests > 1 ? "s" : ""}
            </p>

            {nightlyPrice ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-5">
                <p className="text-sm text-[var(--foreground-muted)]">{formatUsd(nightlyPrice)} / night</p>
                <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
                  {nights} night{nights > 1 ? "s" : ""}
                </p>
                <p className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                  Total {formatUsd(totalPrice ?? nightlyPrice)}
                </p>
              </div>
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-amber-200/80 bg-amber-50/90 p-4 text-sm font-medium text-amber-950">
                Live price unavailable for selected dates.
              </div>
            )}

            {externalCheckoutUrl ? (
              <a
                href={externalCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary block w-full py-3.5 text-center text-[0.9375rem]"
              >
                Confirm booking
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3.5 text-center text-sm font-semibold text-[var(--foreground-subtle)]"
              >
                Confirm booking
              </button>
            )}
            {!externalCheckoutUrl && (
              <p className="text-xs text-[var(--foreground-subtle)]">
                Missing city or dates, so external Booking.com redirect is unavailable.
              </p>
            )}

            <Link
              href={`/hotels/${hotel.id}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${guests}`}
              className="btn-ghost block w-full text-center text-sm"
            >
              ← Back to hotel details
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}
