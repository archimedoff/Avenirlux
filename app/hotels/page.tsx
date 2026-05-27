import { HotelCard } from "@/components/hotel-card";
import { getHotelsByCity } from "@/lib/hotels-data";

type HotelsPageProps = {
  searchParams: Promise<{
    city?: string;
  }>;
};

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;
  const hotels = getHotelsByCity(params.city);

  return (
    <main className="space-y-8 pb-8 sm:space-y-10">
      <section className="glass-card p-8 sm:p-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          Curated stays
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
          {params.city ? `${params.city}, privately selected` : "AvenirLux hotels"}
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          {hotels.length} luxury properties with cinematic spaces, thoughtful service, and a slower rhythm.
        </p>
      </section>

      {hotels.length === 0 ? (
        <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-sm)]">
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">No stays found in this destination.</p>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">Try another city from the featured destinations.</p>
        </section>
      ) : (
        <section className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </section>
      )}
    </main>
  );
}
