import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { auth } from "@/auth";
import { bookingRepository } from "@/lib/db/repositories/booking-repository";
import { favoritesRepository } from "@/lib/db/repositories/favorites-repository";
import { userRepository } from "@/lib/db/repositories/user-repository";
import { fetchHotelById } from "@/lib/hotels-data";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth?callbackUrl=/account");

  const userRecord = await userRepository.findById(session.user.id);
  if (!userRecord) redirect("/auth");

  const { passwordHash: _, ...user } = userRecord;
  const bookings = await bookingRepository.listByUser(session.user.id);
  const favoriteIds = await favoritesRepository.list(session.user.id);

  const savedHotels = (
    await Promise.all(favoriteIds.map((id) => fetchHotelById(id, {})))
  ).filter((h): h is NonNullable<typeof h> => h !== null);

  return (
    <main className="space-y-8 pb-12">
      <section className="glass-card p-8 sm:p-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Your account</p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--luxury-ink)] sm:text-4xl">
          Private member space
        </h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)]">
          Upcoming journeys, saved residences, and concierge preferences — composed with the same quiet care as your stay.
        </p>
      </section>
      <AccountDashboard user={user} bookings={bookings} savedHotels={savedHotels} />
    </main>
  );
}
