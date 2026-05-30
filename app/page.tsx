import Image from "next/image";
import Link from "next/link";

import { RecentlyViewedStrip } from "@/components/recently-viewed-strip";
import { SearchBar } from "@/components/search-bar";
import { getDestinations } from "@/lib/hotels-service";

const cinematicSrc =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85";

export default function HomePage() {
  const featuredCities = getDestinations().slice(0, 8);

  return (
    <main className="page-enter space-y-16 pb-12 sm:space-y-20 sm:pb-16">
      <section className="cinematic-bleed group relative flex min-h-[100svh] flex-col overflow-hidden">
        <Image
          src={cinematicSrc}
          alt="Calm resort pool and ocean horizon at golden hour"
          fill
          priority
          sizes="100vw"
          className="luxury-image-fade object-cover transition-[transform,filter] duration-[2.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080807]/60 via-[#080807]/30 to-[#080807]/95" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(201,169,98,0.08)_0%,transparent_60%)]" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-[var(--container)] flex-1 flex-col px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8 lg:pt-36">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center text-center lg:max-w-4xl">
            <p className="animate-fade-up eyebrow eyebrow-gold">Invited stays · Live availability</p>
            <h1 className="font-display animate-fade-up-delay-1 mt-8 text-[2.5rem] font-light leading-[1.05] tracking-[-0.03em] text-[var(--foreground)] sm:mt-10 sm:text-[3.25rem] lg:text-[4.25rem]">
              Quiet places.
              <span className="mt-2 block text-[0.85em] font-extralight italic text-[var(--foreground-muted)]">
                Meant to be remembered.
              </span>
            </h1>
            <p className="animate-fade-up-delay-2 mt-6 max-w-md text-[0.9375rem] leading-[1.7] text-[var(--foreground-muted)] sm:mt-8 sm:max-w-lg sm:text-base">
              Exceptional hotels — space, service, and stillness.
            </p>
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
              {["Vetted", "Concierge", "Clear pricing"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[var(--border)] bg-white/[0.04] px-4 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[var(--foreground-muted)] backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-[var(--border-strong)] hover:bg-white/[0.06]"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="animate-fade-up-delay-3 mt-auto w-full max-w-4xl pt-12 sm:pt-16 lg:pt-20">
              <SearchBar />
            </div>
          </div>
        </div>
        <div className="relative z-10 flex justify-center pb-8">
          <span className="flex flex-col items-center gap-2 text-[var(--foreground-subtle)]">
            <span className="text-[0.625rem] uppercase tracking-[0.2em]">Scroll</span>
            <span className="block h-8 w-px bg-gradient-to-b from-[var(--luxury-gold-muted)] to-transparent" aria-hidden />
          </span>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[var(--container)] space-y-16 px-4 sm:space-y-20 sm:px-6 lg:px-8">
        <RecentlyViewedStrip />
        <section className="section-luxury-sm space-y-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow eyebrow-gold">Destinations</p>
              <h2 className="font-display mt-4 text-3xl font-light tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
                Where to begin
              </h2>
              <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
                Each destination tells a story — discover the world&apos;s most considered places to stay.
              </p>
            </div>
            <Link href="/hotels" className="btn-ghost self-start text-[0.875rem] transition-transform duration-300 hover:translate-x-0.5 sm:self-auto">
              View all stays
              <span className="ml-1.5 text-[var(--luxury-gold)]" aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featuredCities.map((city) => (
              <Link key={city.name} href={`/hotels?city=${encodeURIComponent(city.name)}`} className="destination-card group">
                <div className="destination-card__media relative">
                  <Image
                    src={city.image}
                    alt=""
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                    className="object-cover transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <div className="destination-card__overlay" aria-hidden />
                  <div className="destination-card__content">
                    <p className="eyebrow text-white/60">{city.tag}</p>
                    <p className="font-display mt-2 text-2xl font-light tracking-[-0.02em] text-white">{city.name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/65 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      Explore availability and nightly rates.
                    </p>
                    <span className="mt-4 inline-flex items-center text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-[var(--luxury-gold)] opacity-0 transition-all duration-500 group-hover:opacity-100">
                      Discover
                      <span className="ml-1.5 transition-transform duration-500 group-hover:translate-x-1" aria-hidden>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
