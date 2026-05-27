import Link from "next/link";

import type { Hotel } from "@/lib/hotel-types";

type HotelCardProps = {
  hotel: Hotel;
  detailQueryString?: string;
};

export function HotelCard({ hotel, detailQueryString }: HotelCardProps) {
  const href = detailQueryString ? `/hotel/${hotel.id}?${detailQueryString}` : `/hotel/${hotel.id}`;
  const rating = hotel.rating || 0;

  return (
    <article
      className="hotel-card group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] ring-0 transition-[transform,box-shadow,border-color,ring-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-[rgba(9,9,11,0.12)] hover:shadow-[var(--shadow-xl)] hover:ring-1 hover:ring-[rgba(255,255,255,0.6)]"
    >
      <Link
        href={href}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--luxury-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        <div className="hotel-card-media relative aspect-[4/3] w-full bg-[var(--surface-muted)] sm:aspect-[2/1]">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="luxury-image-fade h-full w-full object-cover transition-[transform,filter] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:brightness-[1.03]"
            loading="lazy"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,rgba(9,9,11,0.55)_0%,transparent_58%)] opacity-90 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--luxury-ink)]/85 via-[var(--luxury-ink)]/25 to-transparent opacity-95 transition-opacity duration-500 group-hover:from-[var(--luxury-ink)]/90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40"
            aria-hidden
          />
          <div className="absolute left-4 top-4 z-[1] flex items-center gap-2 sm:left-5 sm:top-5">
            <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[0.6875rem] font-semibold tracking-wide text-white shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-md">
              ★ {rating.toFixed(1)}
            </span>
            <span
              aria-label="Favorite stay"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white/90 backdrop-blur-md transition-[transform,background-color,border-color] duration-300 group-hover:scale-105 group-hover:border-white/60 group-hover:bg-black/35"
            >
              ♡
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-[1] flex items-end justify-between gap-3 p-4 sm:p-5">
            <p className="max-w-[65%] font-display text-lg font-medium leading-snug tracking-[-0.02em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-xl">
              {hotel.name}
            </p>
            <span className="shrink-0 translate-y-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white opacity-0 backdrop-blur-md transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
              View
            </span>
          </div>
        </div>
        <div className="space-y-4 p-5 sm:space-y-[1.05rem] sm:p-6">
          <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
            {hotel.location}, {hotel.city}
          </p>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="badge">
                {amenity}
              </span>
            ))}
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--foreground-subtle)]">{hotel.description}</p>
          <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-[0.8125rem] font-medium text-[var(--foreground-subtle)]">From</p>
            <p className="text-right">
              <span className="font-display text-2xl font-medium tracking-[-0.03em] text-[var(--foreground)]">
                ${hotel.pricePerNight ?? "—"}
              </span>
              <span className="text-sm font-medium text-[var(--foreground-muted)]"> / night</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
