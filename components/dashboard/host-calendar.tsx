"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { BookingRequestRecord, HostListingRecord } from "@/lib/db/types";

const hostNav = [
  { href: "/host", label: "Overview", icon: "◈" },
  { href: "/host/listings", label: "Listings", icon: "◇" },
  { href: "/host/bookings", label: "Bookings", icon: "◉" },
  { href: "/host/calendar", label: "Calendar", icon: "◌" },
  { href: "/host/analytics", label: "Analytics", icon: "◎" },
  { href: "/list-property", label: "Add property", icon: "＋" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HostCalendarClient({ listings, requests }: { listings: HostListingRecord[]; requests: BookingRequestRecord[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const bookedDates = new Set<string>();
  requests.filter((r) => r.status !== "declined").forEach((r) => {
    const start = new Date(r.checkIn);
    const end = new Date(r.checkOut);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      bookedDates.add(d.toISOString().slice(0, 10));
    }
  });

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <DashboardShell title="Reservation calendar" subtitle="Occupancy and availability at a glance" nav={hostNav} badge="Host">
      <div className="mb-4 flex flex-wrap gap-2">
        {listings.map((l) => (
          <span key={l.id} className="badge-dark text-xs">{l.name}</span>
        ))}
      </div>
      <article className="dash-panel">
        <p className="mb-4 font-display text-xl font-medium">{today.toLocaleString("default", { month: "long", year: "numeric" })}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[var(--foreground-subtle)]">
          {DAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const iso = new Date(year, month, day).toISOString().slice(0, 10);
            const booked = bookedDates.has(iso);
            return (
              <div key={iso} className={`dash-cal-day ${booked ? "dash-cal-day--booked" : ""}`}>
                {day}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-[var(--foreground-muted)]">● Booked nights · Tap availability controls in listing editor</p>
      </article>
    </DashboardShell>
  );
}
