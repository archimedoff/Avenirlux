"use client";

import Link from "next/link";

import { formatUsd, buildStayQuery, defaultCheckIn, defaultCheckOut } from "@/lib/booking-utils";
import type { ConciergeHotelPick } from "@/lib/concierge/types";

type Props = { hotels: ConciergeHotelPick[]; city?: string };

export function ConciergeHotelCards({ hotels, city }: Props) {
  if (!hotels.length) return null;
  const qs = buildStayQuery({
    city: city || hotels[0]?.city,
    checkIn: defaultCheckIn(),
    checkOut: defaultCheckOut(),
    guests: 2,
  });

  return (
    <div className="concierge-hotels">
      <p className="concierge-hotels__label">Selected residences</p>
      <ul className="concierge-hotels__list">
        {hotels.map((hotel) => (
          <li key={hotel.id}>
            <Link href={`/hotel/${hotel.id}?${qs}`} className="concierge-hotel-card">
              <img src={hotel.image} alt="" className="concierge-hotel-card__img" loading="lazy" />
              <div className="concierge-hotel-card__body">
                <p className="concierge-hotel-card__name">{hotel.name}</p>
                <p className="concierge-hotel-card__meta">
                  {hotel.hotelType} · {hotel.starRating.toFixed(1)}★ · Guest {hotel.rating.toFixed(1)}
                </p>
                <p className="concierge-hotel-card__price">
                  From <strong>{formatUsd(hotel.pricePerNight)}</strong>
                  <span> / night</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
