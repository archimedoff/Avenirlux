import Link from "next/link";
import { notFound } from "next/navigation";

import { HotelCard } from "@/components/hotel-card";
import { getHotelById, getSimilarHotels } from "@/lib/hotels-data";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type HotelDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
  const { id } = await params;
  const hotel = getHotelById(id);

  if (!hotel) notFound();

  const similarStays = getSimilarHotels(hotel.id, 3);

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
            Booking
          </p>
          <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
            {formatUsd(hotel.pricePerNight)}
            <span className="text-lg font-medium text-[var(--foreground-muted)]"> / night</span>
          </p>
          <p className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4 text-sm leading-relaxed text-[var(--foreground-muted)]">
            Flexible cancellation up to 7 days before arrival.
          </p>
          <Link href={`/booking?hotelId=${hotel.id}`} className="btn-primary block w-full py-3.5 text-center text-[0.9375rem]">
            Request reservation
          </Link>
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

      <section className="glass-card space-y-5 p-7 sm:p-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Guest reviews
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {hotel.reviewsSummary.map((review) => (
            <article key={review} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">“{review}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Similar stays
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)]">
              You may also like
            </h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {similarStays.map((similarHotel) => (
            <HotelCard key={similarHotel.id} hotel={similarHotel} />
          ))}
        </div>
      </section>
    </main>
  );
}
