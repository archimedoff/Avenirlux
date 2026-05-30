"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HotelCard } from "@/components/hotel-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecentlyViewedStrip } from "@/components/recently-viewed-strip";
import { formatUsd } from "@/lib/booking-utils";
import { cancelBooking } from "@/lib/bookings-api";
import { COUNTRIES } from "@/lib/countries";
import type { ConciergePreferences, PublicUser, UserBookingRecord } from "@/lib/db/types";
import type { Hotel } from "@/lib/hotel-types";

type Props = {
  user: PublicUser;
  bookings: UserBookingRecord[];
  savedHotels: Hotel[];
};

export function AccountDashboard({ user: initialUser, bookings: initialBookings, savedHotels }: Props) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [user, setUser] = useState(initialUser);
  const [phone, setPhone] = useState(initialUser.profile.phone || "");
  const [country, setCountry] = useState(initialUser.profile.country || "");
  const [concierge, setConcierge] = useState<ConciergePreferences>(initialUser.conciergePreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status !== "upcoming");

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: { phone, country }, conciergePreferences: concierge }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setMessage("Preferences saved");
    } else {
      setMessage("Could not save — try again");
    }
  };

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className="space-y-10">
      <section className="glass-card p-6 sm:p-8">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Member</p>
        <h2 className="font-display mt-2 text-2xl font-medium tracking-[-0.03em]">
          {user.firstName} {user.lastName}
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">{user.email}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-display text-xl font-medium tracking-[-0.02em]">Upcoming stays</h3>
          <Link href="/hotels" className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            Book another →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming stays"
            description="Your next journey begins with a single reservation."
            action={{ href: "/hotels", label: "Explore hotels" }}
          />
        ) : (
          <div className="grid gap-4">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={async (id) => {
                  await cancelBooking(id);
                  setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "cancelled" as const } : x)));
                  router.refresh();
                }}
              />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-display text-xl font-medium tracking-[-0.02em]">Booking history</h3>
          <div className="grid gap-4">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} muted />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="font-display text-xl font-medium tracking-[-0.02em]">Saved hotels</h3>
        {savedHotels.length === 0 ? (
          <EmptyState
            title="No saved hotels"
            description="Tap the heart on any stay to save it here."
            action={{ href: "/hotels", label: "Browse stays" }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {savedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      <RecentlyViewedStrip />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-4 p-6 sm:p-8">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Profile settings</h3>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium mt-2" type="tel" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Country
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-premium mt-2">
              <option value="">Select</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="glass-card space-y-4 p-6 sm:p-8">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Concierge preferences</h3>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Preferred contact
            <select
              value={concierge.contactChannel}
              onChange={(e) => setConcierge({ ...concierge, contactChannel: e.target.value as ConciergePreferences["contactChannel"] })}
              className="input-premium mt-2"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Language
            <input
              value={concierge.preferredLanguage}
              onChange={(e) => setConcierge({ ...concierge, preferredLanguage: e.target.value })}
              className="input-premium mt-2"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Dietary notes
            <textarea
              value={concierge.dietaryNotes || ""}
              onChange={(e) => setConcierge({ ...concierge, dietaryNotes: e.target.value })}
              rows={2}
              className="input-premium mt-2 resize-none"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Transport notes
            <textarea
              value={concierge.transportNotes || ""}
              onChange={(e) => setConcierge({ ...concierge, transportNotes: e.target.value })}
              rows={2}
              className="input-premium mt-2 resize-none"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={saveProfile} disabled={saving} className="btn-primary !px-6">
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {message && <p className="text-sm text-[var(--foreground-muted)]">{message}</p>}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  muted,
  onCancel,
}: {
  booking: UserBookingRecord;
  muted?: boolean;
  onCancel?: (id: string) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);

  return (
    <article className={`flex gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] p-4 ${muted ? "opacity-80" : "bg-[var(--surface-elevated)]"}`}>
      <img src={booking.hotelImage} alt="" className="h-24 w-28 shrink-0 rounded-[var(--radius-lg)] object-cover" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{booking.hotelName}</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          {booking.roomName} · {booking.checkIn} → {booking.checkOut}
        </p>
        <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
          Ref {booking.confirmationRef} ·{" "}
          <span className={booking.status === "cancelled" ? "text-red-400" : "capitalize"}>{booking.status.replace("_", " ")}</span>
        </p>
        <p className="mt-1 font-display text-lg font-light">{formatUsd(booking.total)}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={`/hotel/${booking.hotelId}`} className="text-sm font-medium text-[var(--luxury-gold-muted)] hover:text-[var(--luxury-gold)]">
            View hotel
          </Link>
          {!muted && booking.status === "upcoming" && onCancel && (
            <button
              type="button"
              disabled={cancelling}
              className="text-sm text-[var(--foreground-muted)] hover:text-red-400 disabled:opacity-50"
              onClick={async () => {
                if (!confirm("Cancel this reservation?")) return;
                setCancelling(true);
                try {
                  await onCancel(booking.id);
                } finally {
                  setCancelling(false);
                }
              }}
            >
              {cancelling ? "Cancelling…" : "Cancel stay"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
