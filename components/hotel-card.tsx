import Link from "next/link";
import { memo } from "react";

import { FavoriteButton } from "@/components/favorite-button";
import { formatUsd } from "@/lib/booking-utils";
import type { Hotel } from "@/lib/hotel-types";

type HotelCardProps = {
  hotel: Hotel;
  detailQueryString?: string;
  immersive?: boolean;
};

function HotelCardInner({ hotel, detailQueryString, immersive = true }: HotelCardProps) {
  const href = detailQueryString ? `/hotel/${hotel.id}?${detailQueryString}` : `/hotel/${hotel.id}`;
  const rating = hotel.rating || 0;
  const stars = hotel.starRating ?? 5;
  const hotelType = hotel.hotelType ?? "Hotel";

  if (immersive) {
    return (
      <article className="hotel-card hotel-card--immersive group relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-md)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
        <Link
          href={href}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--luxury-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <div className="hotel-card-media relative w-full bg-[var(--surface-muted)]">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="luxury-image-fade h-full w-full object-cover transition-[transform,filter] duration-[1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080807]/95 via-[#080807]/35 to-transparent" aria-hidden />
            <div className="absolute left-4 top-4 z-[1] flex flex-wrap items-center gap-1.5 sm:left-5 sm:top-5">
              <span className="hotel-badge hotel-badge--stars">{stars.toFixed(1)}★</span>
              <span className="hotel-badge hotel-badge--type">{hotelType}</span>
              <span className={`hotel-badge ${hotel.availability === "available" ? "hotel-badge--avail" : "hotel-badge--limited"}`}>
                {hotel.availability === "available" ? "Available" : "Limited"}
              </span>
              <FavoriteButton hotelId={hotel.id} size="sm" />
            </div>
            <div className="hotel-card-body">
              <p className="eyebrow text-white/55">{hotel.city}{hotel.country ? ` · ${hotel.country}` : ""}</p>
              <p className="font-display mt-2 text-xl font-light leading-snug tracking-[-0.02em] text-white sm:text-2xl">{hotel.name}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">{hotel.description}</p>
            </div>
          </div>
          <div className="hotel-card-footer flex items-baseline justify-between gap-3 bg-[var(--surface-elevated)]">
            <div className="flex flex-wrap gap-1.5">
              {hotel.categories.slice(0, 2).map((cat) => (
                <span key={cat} className="badge text-[0.625rem] capitalize">{cat}</span>
              ))}
            </div>
            <p className="text-right">
              <span className="font-display text-xl font-light tracking-[-0.02em] text-[var(--foreground)]">{formatUsd(hotel.pricePerNight)}</span>
              <span className="text-[0.75rem] text-[var(--foreground-subtle)]"> / night</span>
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="hotel-card group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-xl)]">
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--luxury-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]">
        <div className="hotel-card-media relative aspect-[4/3] w-full bg-[var(--surface-muted)] sm:aspect-[5/3]">
          <img src={hotel.image} alt={hotel.name} className="luxury-image-fade h-full w-full object-cover transition-[transform,filter] duration-[900ms] group-hover:scale-[1.05]" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080807]/90 via-[#080807]/25 to-transparent" aria-hidden />
          <div className="absolute left-4 top-4 z-[1] flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
            <span className="hotel-badge hotel-badge--stars">{stars.toFixed(1)}★</span>
            <span className="hotel-badge hotel-badge--type">{hotelType}</span>
            <span className={`hotel-badge ${hotel.availability === "available" ? "hotel-badge--avail" : "hotel-badge--limited"}`}>{hotel.availability === "available" ? "Available" : "Limited"}</span>
            <span className="hotel-badge hotel-badge--rating">Guest {rating.toFixed(1)}</span>
            <FavoriteButton hotelId={hotel.id} size="sm" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-[1] p-4 sm:p-5">
            <p className="font-display text-lg font-light leading-snug tracking-[-0.02em] text-white sm:text-xl">{hotel.name}</p>
            <p className="mt-1 text-sm text-white/70">{hotel.city}{hotel.country ? ` · ${hotel.country}` : ""}</p>
          </div>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <p className="line-clamp-1 text-sm text-[var(--foreground-muted)]">{hotel.location}</p>
          <div className="flex flex-wrap gap-1.5">
            {hotel.categories.slice(0, 2).map((cat) => (<span key={cat} className="badge text-[0.6875rem] capitalize">{cat}</span>))}
            {hotel.amenities.slice(0, 3).map((amenity) => (<span key={amenity} className="badge text-[0.6875rem]">{amenity}</span>))}
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--foreground-subtle)]">{hotel.description}</p>
          <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-[0.8125rem] font-medium text-[var(--foreground-subtle)]">From</p>
            <p className="text-right">
              <span className="font-display text-2xl font-light tracking-[-0.03em] text-[var(--foreground)]">{formatUsd(hotel.pricePerNight)}</span>
              <span className="text-sm font-medium text-[var(--foreground-muted)]"> / night</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export const HotelCard = memo(HotelCardInner);
