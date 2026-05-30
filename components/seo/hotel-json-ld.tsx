import { getSiteUrl } from "@/lib/site";
import type { Hotel } from "@/lib/hotel-types";

type Props = {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
};

export function HotelJsonLd({ hotel, checkIn, checkOut }: Props) {
  const siteUrl = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    image: hotel.image,
    url: `${siteUrl}/hotel/${hotel.id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    starRating: hotel.starRating
      ? { "@type": "Rating", ratingValue: hotel.starRating }
      : undefined,
    aggregateRating: hotel.rating
      ? { "@type": "AggregateRating", ratingValue: hotel.rating, reviewCount: Math.max(1, Math.round(hotel.rating * 10)) }
      : undefined,
    priceRange: `$${hotel.pricePerNight}+`,
    ...(checkIn && checkOut
      ? {
          makesOffer: {
            "@type": "Offer",
            price: hotel.pricePerNight,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            validFrom: checkIn,
            validThrough: checkOut,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
