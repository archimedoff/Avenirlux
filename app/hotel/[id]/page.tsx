import type { Metadata } from "next";
import { cache } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/favorite-button";
import { HotelBookingSidebar } from "@/components/hotel-booking-sidebar";
import { HotelCard } from "@/components/hotel-card";
import { HotelTrackView } from "@/components/hotel-track-view";
import { buildStayQuery } from "@/lib/booking-utils";
import { fetchHotelById, fetchSimilarHotels } from "@/lib/hotels-data";

const getHotelCached = cache(fetchHotelById);


type MetaProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string; city?: string }>;
};

export async function generateMetadata({ params, searchParams }: MetaProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const hotel = await getHotelCached(id, {
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: Number(query.guests || "2") || 2,
    city: query.city,
  });
  if (!hotel) return { title: "Stay not found" };
  const locationLabel = [hotel.city, hotel.country].filter(Boolean).join(", ");
  const description =
    hotel.description.slice(0, 155) ||
    `Luxury ${hotel.hotelType} in ${locationLabel}. From ${hotel.pricePerNight} per night.`;
  return {
    title: `${hotel.name}${locationLabel ? ` · ${locationLabel}` : ""}`,
    description,
    keywords: [hotel.name, hotel.city, hotel.hotelType, ...hotel.categories, "luxury hotel", "AvenirLux"].filter(Boolean),
    openGraph: {
      title: hotel.name,
      description: hotel.poeticTagline || description,
      images: hotel.image ? [{ url: hotel.image, alt: hotel.name, width: 1200, height: 630 }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: hotel.name,
      description: hotel.poeticTagline || description,
      images: hotel.image ? [hotel.image] : undefined,
    },
  };
}

type HotelDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomId?: string;
    city?: string;
  }>;
};

export default async function HotelDetailPage({ params, searchParams }: HotelDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const hotel = await getHotelCached(id, {
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: Number(query.guests || "2") || 2,
    city: query.city,
  });

  if (!hotel) notFound();

  const guests = Number(query.guests || "2") || 2;
  const detailQuery = buildStayQuery({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests,
    roomId: query.roomId,
    city: query.city || hotel.city,
  });

  const similarStays = await fetchSimilarHotels(hotel.id, hotel.city, {
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests,
  });

  const amenityIcons = ["✦", "◉", "◌", "◈", "◐", "◎", "◆", "●"];
  const poeticLine = hotel.poeticTagline;
  const experienceNarrative = hotel.description;

  return (
    <main className="space-y-8 pb-28 sm:space-y-10 lg:pb-10">
      <HotelTrackView id={hotel.id} name={hotel.name} image={hotel.image} city={hotel.city} />
      <section className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--luxury-warm)] shadow-[var(--shadow-xl)]">
        <div className="absolute inset-x-0 top-0 z-20 p-4 sm:p-6">
          <div className="glass-card-soft flex items-center justify-between rounded-full px-3 py-2 sm:px-4">
            <Link href="/hotels" className="btn-ghost !px-2 text-xs sm:text-sm">
              ← All stays
            </Link>
            <FavoriteButton hotelId={hotel.id} size="sm" />
          </div>
        </div>
        <div className="relative aspect-[5/6] w-full sm:aspect-[16/9] lg:aspect-[24/9]">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover transition-[transform,filter] duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:brightness-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/78" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 z-[1] p-5 sm:p-8 lg:p-12">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/75">{hotel.city}</p>
            <h1 className="font-display mt-3 max-w-5xl text-[2rem] font-medium leading-[1.03] tracking-[-0.035em] text-white sm:text-[2.7rem] lg:text-[3.7rem]">
              {hotel.name}
            </h1>
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-white/78 sm:text-base">
              ⌖ {hotel.location}
              {hotel.country ? `, ${hotel.country}` : ""}
            </p>
            <p className="font-display mt-4 max-w-3xl text-[1.02rem] italic leading-relaxed text-white/82 sm:text-[1.14rem]">
              {poeticLine}
            </p>
          </div>
        </div>
      </section>

      {hotel.gallery.length > 1 && (
        <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {hotel.gallery.slice(0, 6).map((image) => (
            <div
              key={image}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-sm)]"
            >
              <div className="aspect-[4/3] w-full">
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover opacity-92 transition-[transform,opacity] duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </section>
      )}

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
                ★ {hotel.rating.toFixed(1)}
                {hotel.reviews > 0 ? ` · ${hotel.reviews} reviews` : ""}
              </p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                Amenities
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {hotel.amenities.map((amenity, index) => (
                  <article
                    key={amenity}
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]"
                  >
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      <span className="mr-2 text-[var(--foreground-muted)]">{amenityIcons[index % amenityIcons.length]}</span>
                      {amenity}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Curated experiences
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {hotel.experiences.map((item) => (
                <article key={item} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
                  <p className="text-sm font-medium text-[var(--foreground)]">{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Cancellation
            </p>
            <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">{hotel.cancellationPolicy}</p>
          </section>

          {hotel.reviewsSummary.length > 0 && (
            <section className="glass-card space-y-5 p-7 sm:p-10">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                Guest reviews
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {hotel.reviewsSummary.map((review) => (
                  <article key={review} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
                    <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">"{review}"</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Concierge</p>
            <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-sm font-semibold text-white">
                AX
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">AvenirLux Private Host Team</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Local concierge available 24/7 for arrivals, dining, and curated experiences.
                </p>
              </div>
            </div>
          </section>

          <section className="glass-card space-y-5 p-7 sm:p-10">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Location</p>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
              <div className="relative flex aspect-[16/8] items-end bg-[linear-gradient(145deg,#d6d3d1_0%,#e7e5e4_45%,#f5f5f4_100%)] p-5">
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#e7e5e4_0%,#d6d3d1_50%,#fafaf9_100%)]"
                  aria-hidden
                />
                {hotel.coordinates.lat !== 0 && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--luxury-ink)] shadow-[0_0_0_8px_rgba(9,9,11,0.12)]"
                    aria-hidden
                  />
                )}
                <div className="relative rounded-[var(--radius-lg)] border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] backdrop-blur-md">
                  {hotel.location}
                  {hotel.coordinates.lat !== 0 && (
                    <span className="mt-1 block text-xs font-normal text-[var(--foreground-muted)]">
                      {hotel.coordinates.lat.toFixed(4)}°, {hotel.coordinates.lng.toFixed(4)}°
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <HotelBookingSidebar
          hotel={hotel}
          initialCheckIn={query.checkIn}
          initialCheckOut={query.checkOut}
          initialGuests={guests}
          initialRoomId={query.roomId}
        />
      </section>

      {similarStays.length > 0 && (
        <section className="space-y-4">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Similar stays
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)]">
              You may also like
            </h2>
          </div>
          <div className="luxury-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
            {similarStays.map((similarHotel) => (
              <div key={similarHotel.id} className="min-w-[88%] snap-start sm:min-w-[48%] xl:min-w-[33%]">
                <HotelCard hotel={similarHotel} detailQueryString={detailQuery} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
