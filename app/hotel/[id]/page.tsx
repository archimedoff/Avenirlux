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
  const amenityIcons = ["✦", "◉", "◌", "◈", "◐", "◎", "◆", "●"];
  const poeticLine = `Dawn light over ${hotel.city}, long shadows, and spaces designed to quiet the mind.`;
  const experienceNarrative = `${hotel.description} The rhythm here is intentionally slow: mornings unfold with natural light, afternoons flow between water and wellness, and evenings return to intimate dining and deep stillness. Every touchpoint is discreet, personal, and composed for guests who value privacy over spectacle.`;

  return (
    <main className="space-y-8 pb-28 sm:space-y-10 lg:pb-10">
      <section className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--luxury-warm)] shadow-[var(--shadow-xl)]">
        <div className="absolute inset-x-0 top-0 z-20 p-4 sm:p-6">
          <div className="glass-card-soft flex items-center justify-between rounded-full px-3 py-2 sm:px-4">
            <Link href="/hotels" className="btn-ghost !px-2 text-xs sm:text-sm">
              ← All stays
            </Link>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-icon !h-8 !w-8 rounded-full !p-0 text-xs">
                ♡
              </button>
              <button type="button" className="btn-icon !h-8 !w-8 rounded-full !p-0 text-xs">
                ↗
              </button>
            </div>
          </div>
        </div>
        <div className="relative aspect-[5/6] w-full sm:aspect-[16/9] lg:aspect-[24/9]">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover transition-[transform,filter] duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:brightness-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/78" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_0%,rgba(255,255,255,0.18)_0%,transparent_60%)]" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 z-[1] p-5 sm:p-8 lg:p-12">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/75">{hotel.city}</p>
            <h1 className="font-display mt-3 max-w-5xl text-[2rem] font-medium leading-[1.03] tracking-[-0.035em] text-white drop-shadow-[0_6px_32px_rgba(0,0,0,0.45)] sm:text-[2.7rem] lg:text-[3.7rem]">
              {hotel.name}
            </h1>
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-white/78 sm:text-base">
              ⌖ {hotel.location}, {hotel.country}
            </p>
            <p className="font-display mt-4 max-w-3xl text-[1.02rem] italic leading-relaxed text-white/82 sm:text-[1.14rem]">
              {poeticLine}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {hotel.gallery.map((image) => (
          <div
            key={image}
            className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-sm)]"
          >
            <div className="aspect-[4/3] w-full">
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover opacity-92 transition-[transform,opacity,filter] duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.04] group-hover:opacity-100 group-hover:brightness-[1.03]"
              />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:items-start lg:gap-10">
        <div className="space-y-7">
          <section className="glass-card space-y-6 p-7 sm:p-10">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-3xl">
                  Crafted for quiet luxury
                </h2>
                <p className="max-w-3xl text-[0.97rem] leading-[1.75] text-[var(--foreground-muted)]">{experienceNarrative}</p>
              </div>
              <p className="badge-dark w-fit shrink-0 px-4 py-2 text-[0.8125rem] font-semibold">
                ★ {hotel.rating} · {hotel.reviews} reviews
              </p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                Amenities
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {hotel.amenities.map((amenity, index) => {
                  return (
                    <article
                      key={amenity}
                      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]"
                    >
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        <span className="mr-2 text-[var(--foreground-muted)]">{amenityIcons[index % amenityIcons.length]}</span>
                        {amenity}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Curated experiences
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "Private sunrise ritual",
                "Chef-led local tasting",
                "Signature wellness journey",
              ].map((item) => (
                <article key={item} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
                  <p className="text-sm font-medium text-[var(--foreground)]">{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">House rules</p>
            <div className="grid gap-2">
              {[
                "Check-in from 3:00 PM",
                "No parties or events",
                "Quiet hours after 10:00 PM",
                "Respect resort privacy standards",
              ].map((rule) => (
                <p key={rule} className="text-sm text-[var(--foreground-muted)]">
                  • {rule}
                </p>
              ))}
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Guest reviews
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {hotel.reviewsSummary.map((review) => (
                <article key={review} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
                  <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">“{review}”</p>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Host</p>
            <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-sm font-semibold text-white">
                AX
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">AvenirLux Private Host Team</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">Local concierge available 24/7 for arrivals, dining, and curated experiences.</p>
              </div>
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Location</p>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
              <div className="relative flex aspect-[16/8] items-end bg-[linear-gradient(145deg,#d6d3d1_0%,#e7e5e4_45%,#f5f5f4_100%)] p-5">
                <div className="rounded-[var(--radius-lg)] border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] backdrop-blur-md">
                  {hotel.location}, {hotel.city}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="glass-card sticky top-20 h-fit space-y-5 p-6 sm:p-8 lg:top-24">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Booking</p>
          <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
            {formatUsd(hotel.pricePerNight)}
            <span className="text-lg font-medium text-[var(--foreground-muted)]"> / night</span>
          </p>
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              Check-in
              <input type="date" className="input-premium mt-2" />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              Check-out
              <input type="date" className="input-premium mt-2" />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              Guests
              <select className="input-premium mt-2">
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4 guests</option>
                <option>5 guests</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              Availability
              <div className="mt-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="grid grid-cols-7 gap-1.5 text-center text-[0.6875rem] text-[var(--foreground-subtle)]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                  {Array.from({ length: 14 }).map((_, index) => (
                    <span
                      key={index}
                      className={`rounded py-1 ${index === 8 || index === 9 ? "bg-[var(--luxury-ink)] text-white" : "bg-[var(--surface-muted)] text-[var(--foreground-muted)]"}`}
                    >
                      {index + 12}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--foreground-subtle)]">{formatUsd(hotel.pricePerNight)} × 3 nights</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">Total {formatUsd(hotel.pricePerNight * 3)}</p>
          </div>
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
        <div className="luxury-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
          {similarStays.map((similarHotel) => (
            <div key={similarHotel.id} className="min-w-[88%] snap-start sm:min-w-[48%] xl:min-w-[33%]">
              <HotelCard hotel={similarHotel} />
            </div>
          ))}
        </div>
      </section>
      <div className="fixed inset-x-3 bottom-3 z-40 rounded-[var(--radius-lg)] border border-white/60 bg-white/85 p-3 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {formatUsd(hotel.pricePerNight)}
            <span className="ml-1 text-xs font-medium text-[var(--foreground-subtle)]">/ night</span>
          </p>
          <Link href={`/booking?hotelId=${hotel.id}`} className="btn-primary !py-2.5 !px-4 text-xs">
            Reserve
          </Link>
        </div>
      </div>
    </main>
  );
}
