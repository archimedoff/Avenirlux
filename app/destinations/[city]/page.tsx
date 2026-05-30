import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HotelCard } from "@/components/hotel-card";
import { buildStayQuery } from "@/lib/booking-utils";
import { fetchHotels } from "@/lib/hotels-data";
import { getDestinationByCity } from "@/lib/liteapi/destinations";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const dest = getDestinationByCity(decodeURIComponent(city));
  if (!dest) return { title: "Destination" };
  return {
    title: `Luxury hotels in ${dest.name}`,
    description: `${dest.tag} — curated quiet-luxury stays in ${dest.name} with AvenirLux.`,
    openGraph: { title: `${dest.name} · AvenirLux`, description: dest.tag },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { city: slug } = await params;
  const cityName = decodeURIComponent(slug).replace(/-/g, " ");
  const dest = getDestinationByCity(cityName);
  if (!dest) notFound();
  const normalized = dest.name;
  const { hotels } = await fetchHotels({ city: normalized, limit: 12 });
  const query = buildStayQuery({ city: normalized });
  return (
    <main className="page-enter mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow eyebrow-gold">Destination</p>
      <h1 className="font-display mt-3 text-4xl font-light tracking-[-0.03em] sm:text-5xl">{dest.name}</h1>
      <p className="mt-3 max-w-2xl text-[var(--foreground-muted)]">{dest.tag} — privately selected residences.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (<HotelCard key={hotel.id} hotel={hotel} detailQueryString={query} />))}
      </div>
      {hotels.length === 0 && (
        <p className="mt-8 text-sm text-[var(--foreground-muted)]">
          No live availability — <Link href={`/hotels?city=${encodeURIComponent(normalized)}`} className="text-[var(--luxury-gold-muted)]">search all stays</Link>.
        </p>
      )}
    </main>
  );
}
