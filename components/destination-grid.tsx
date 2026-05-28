import Image from "next/image";
import Link from "next/link";

export type DestinationCard = {
  name: string;
  tag: string;
  image: string;
};

type DestinationGridProps = {
  destinations: DestinationCard[];
  title?: string;
  subtitle?: string;
};

export function DestinationGrid({
  destinations,
  title = "Destinations",
  subtitle = "Select a city to explore curated residences",
}: DestinationGridProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          {title}
        </p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {destinations.map((dest) => (
          <Link
            key={dest.name}
            href={`/hotels?city=${encodeURIComponent(dest.name)}`}
            className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-muted)]">
              <Image
                src={dest.image}
                alt=""
                fill
                sizes="(max-width:640px) 50vw, 25vw"
                className="object-cover transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--luxury-ink)]/55 to-transparent"
                aria-hidden
              />
              <p className="absolute bottom-3 left-3 font-display text-sm font-medium text-white">{dest.name}</p>
            </div>
            <p className="px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--foreground-subtle)]">
              {dest.tag}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
