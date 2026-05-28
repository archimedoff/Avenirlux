import Image from "next/image";
import Link from "next/link";

import { SearchBar } from "@/components/search-bar";
import { getDestinations } from "@/lib/hotels-service";

const cinematicSrc =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85";

export default function HomePage() {
  const featuredCities = getDestinations().slice(0, 8);

  return (
    <main className="space-y-10 pb-8 sm:space-y-12 sm:pb-10">
      <section className="group relative flex min-h-[min(92vh,44rem)] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[rgba(9,9,11,0.08)] bg-[#1c1917] shadow-[var(--shadow-lg)] sm:min-h-[min(90vh,52rem)]">
        <Image
          src={cinematicSrc}
          alt="Calm resort pool and ocean horizon at golden hour"
          fill
          priority
          sizes="100vw"
          className="luxury-image-fade object-cover transition-[transform,filter] duration-[1.9s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:brightness-[1.05]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080807]/78 via-[#110f0e]/48 to-[#050404]/90"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_0%,rgba(255,255,255,0.08)_0%,transparent_55%)]"
          aria-hidden
        />
        <div className="hero-luxury-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 flex flex-1 flex-col px-4 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16 lg:px-10 lg:pt-20">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center text-center lg:max-w-4xl">
            <p className="animate-fade-up rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/85 shadow-sm backdrop-blur-md">
              Invited stays · Live availability
            </p>
            <h1 className="font-display animate-fade-up-delay-1 mt-7 text-[2.2rem] font-medium leading-[1.06] tracking-[-0.03em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:mt-8 sm:text-[2.65rem] lg:text-[3.35rem]">
              Quiet places.
              <span className="mt-1 block text-[0.9em] font-normal text-white/78 sm:mt-1.5">
                Meant to be remembered.
              </span>
            </h1>
            <p className="animate-fade-up-delay-2 mt-5 max-w-md text-[0.9375rem] leading-[1.65] text-white/72 sm:mt-6 sm:max-w-lg sm:text-[1.02rem]">
              Exceptional hotels—space, service, and stillness.
            </p>
            <p className="font-display animate-fade-up-delay-2 mt-3 text-xs font-normal tracking-wide text-white/55 sm:text-sm">
              Light, water, and time—slowed down.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3">
              {["Vetted", "Concierge", "Clear pricing"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[0.75rem] font-medium text-white/80 backdrop-blur-md transition-[background-color,border-color] duration-300 hover:border-white/25 hover:bg-black/30 sm:px-4 sm:text-[0.8125rem]"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="animate-fade-up-delay-3 mt-auto w-full max-w-4xl pt-10 sm:pt-12 lg:pt-14">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 sm:space-y-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Destinations
            </p>
            <h2 className="font-display mt-3 text-2xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-[2rem]">
              Where to begin
            </h2>
          </div>
          <Link
            href="/hotels"
            className="btn-ghost self-start transition-transform duration-300 hover:translate-x-0.5 sm:self-auto"
          >
            View all stays
            <span className="ml-1 text-[var(--foreground)]" aria-hidden>
              →
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {featuredCities.map((city) => (
            <Link
              key={city.name}
              href={`/hotels?city=${encodeURIComponent(city.name)}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[rgba(9,9,11,0.08)] bg-[#faf8f5] shadow-[var(--shadow-sm)] ring-0 transition-[transform,box-shadow,border-color,ring-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[rgba(9,9,11,0.11)] hover:shadow-[var(--shadow-float)] hover:ring-1 hover:ring-white/70"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#d6d3cd] sm:aspect-[5/3]">
                <Image
                  src={city.image}
                  alt=""
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  className="object-cover transition-[transform,filter] duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:brightness-[1.04]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c1917]/45 via-[#1c1917]/05 to-transparent opacity-90 transition-opacity duration-500 group-hover:from-[#1c1917]/55"
                  aria-hidden
                />
              </div>
              <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--foreground-subtle)]">
                  {city.tag}
                </p>
                <p className="font-display mt-2.5 text-xl font-medium tracking-[-0.02em] text-[var(--luxury-ink)]">
                  {city.name}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#57534e]">
                  Explore availability and nightly rates.
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--luxury-ink)]">
                  Search
                  <span className="ml-1 transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
