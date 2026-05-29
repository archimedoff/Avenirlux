import Link from "next/link";

import { formatUsd } from "@/lib/booking-utils";
import type { ConciergeHotelPick } from "@/lib/concierge/types";

type Props = {
  hotels: ConciergeHotelPick[];
};

export function ConciergeHotelCards({ hotels }: Props) {
  if (!hotels.length) return null;

  return (
    <div className="concierge-hotels page-enter">
      <p className="concierge-hotels__label">Curated residences</p>
      <ul className="concierge-hotels__list">
        {hotels.map((hotel) => (
          <li key={hotel.id}>
            <Link href={`/hotel/${hotel.id}`} className="concierge-hotel-card">
              <img
                src={hotel.image}
                alt=""
                className="concierge-hotel-card__img"
                loading="lazy"
              />
              <div className="concierge-hotel-card__body">
                <p className="concierge-hotel-card__name font-display">{hotel.name}</p>
                <p className="concierge-hotel-card__meta">
                  {hotel.city}
                  {hotel.starRating ? ` · ${hotel.starRating.toFixed(1)}★` : ""}
                  {hotel.rating ? ` · Guest ${hotel.rating.toFixed(1)}` : ""}
                </p>
                {hotel.pricePerNight > 0 ? (
                  <p className="concierge-hotel-card__price">
                    From {formatUsd(hotel.pricePerNight)} <span className="opacity-70">/ night</span>
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
