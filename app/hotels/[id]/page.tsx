import Link from "next/link";
import { notFound } from "next/navigation";

import { buildBookingComUrl } from "@/lib/checkout";
import { fetchLiteApiHotelById, fetchLiteApiHotelPrice } from "@/lib/liteapi";

type HotelDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

function defaultDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function HotelDetailPage({ params, searchParams }: HotelDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const hotel = await fetchLiteApiHotelById(id);

  if (!hotel) {
    notFound();
  }

  const checkIn = query.checkIn || defaultDate(7);
  const checkOut = query.checkOut || defaultDate(8);
  const guests = Number(query.guests || "2") || 2;

  let livePrice: number | null = null;
  try {
    livePrice = await fetchLiteApiHotelPrice({
      hotelId: hotel.id,
      countryCode: hotel.country,
      checkIn,
      checkOut,
      guests,
    });
  } catch (error) {
    console.error("Failed to fetch hotel price", {
      hotelId: hotel.id,
      checkIn,
      checkOut,
      guests,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const nightlyPrice = livePrice ?? hotel.pricePerNight;
  const hasPrice = Number.isFinite(nightlyPrice) && nightlyPrice > 0;
  const nights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalPrice = hasPrice ? nightlyPrice * nights : null;

  const cityForBooking = [hotel.city, hotel.country].filter(Boolean).join(", ");
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
      <section className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start lg:gap-10">
        <div className="space-y-4">
          <div className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-md)] ring-1 ring-white/30 transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[var(--shadow-xl)]">
            <div className="aspect-[16/10] w-full sm:aspect-[21/9]">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="h-full w-full object-cover transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] group-hover:brightness-[1.02]"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {hotel.gallery.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <div className="aspect-[4/3] w-full">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="glass-card sticky top-20 h-fit space-y-5 p-6 sm:p-8 lg:top-24">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            Reserve
          </p>
          {hasPrice ? (
            <>
              <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
                {formatUsd(nightlyPrice)}
                <span className="text-lg font-medium text-[var(--foreground-muted)]"> / night</span>
              </p>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4">
                <p className="text-xs font-medium text-[var(--foreground-muted)]">
                  {formatUsd(nightlyPrice)} × {nights} night{nights > 1 ? "s" : ""}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  Total {formatUsd(totalPrice ?? nightlyPrice)}
                </p>
              </div>
            </>
          ) : (
            <p className="text-base font-semibold text-[var(--foreground-muted)]">
              No live price for these dates
            </p>
          )}
          <p className="text-sm leading-relaxed text-[var(--foreground-subtle)]">
            Taxes and fees are finalized at checkout.
          </p>
          <p className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground-muted)]">
            {checkIn} → {checkOut} · {guests} guest{guests > 1 ? "s" : ""}
          </p>
          {externalCheckoutUrl ? (
            <a
              href={externalCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-3.5 text-[0.9375rem]"
            >
              Book now
            </a>
          ) : (
            <Link
              href={`/booking?hotelId=${encodeURIComponent(hotel.id)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${guests}`}
              className="btn-primary block w-full py-3.5 text-center text-[0.9375rem]"
            >
              Book now
            </Link>
          )}
          {!externalCheckoutUrl && (
            <p className="text-xs text-[var(--foreground-subtle)]">Preview checkout when partner data is unavailable.</p>
          )}
          <Link href="/hotels" className="btn-ghost block w-full text-center text-sm">
            ← Back to listings
          </Link>
        </aside>
      </section>

      <section className="glass-card space-y-6 p-7 sm:p-10">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
              {hotel.name}
            </h1>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
              {hotel.location}, {hotel.city}, {hotel.country}
            </p>
          </div>
          <p className="badge-dark w-fit shrink-0 px-4 py-2 text-[0.8125rem] font-semibold">
            ★ {hotel.rating} · {hotel.reviews} reviews
          </p>
        </div>

        <p className="max-w-3xl text-[0.9375rem] leading-[1.7] text-[var(--foreground-muted)]">{hotel.description}</p>

        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            Amenities
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {hotel.amenities.map((amenity) => (
              <span key={amenity} className="badge">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
