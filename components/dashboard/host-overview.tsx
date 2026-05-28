"use client";

import Link from "next/link";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import type { HostAnalytics } from "@/lib/dashboard/analytics";
import { formatCurrency, formatPercent } from "@/lib/dashboard/format";

const hostNav = [
  { href: "/host", label: "Overview", icon: "◈" },
  { href: "/host/listings", label: "Listings", icon: "◇" },
  { href: "/host/bookings", label: "Bookings", icon: "◉" },
  { href: "/host/calendar", label: "Calendar", icon: "◌" },
  { href: "/host/analytics", label: "Analytics", icon: "◎" },
  { href: "/list-property", label: "Add property", icon: "＋" },
];

export function HostOverview({ data, listingCount }: { data: HostAnalytics; listingCount: number }) {
  return (
    <DashboardShell title="Host studio" subtitle="Your residences, reservations, and revenue" nav={hostNav} badge="Host">
      <section className="dash-grid-stats">
        <StatCard label="Occupancy" value={formatPercent(data.occupancyRate)} hint="30-day average" accent />
        <StatCard label="Revenue" value={formatCurrency(data.revenueTotal)} hint={`This month ${formatCurrency(data.revenueThisMonth)}`} />
        <StatCard label="Pending requests" value={String(data.pendingRequests)} hint="Awaiting your response" />
        <StatCard label="Live listings" value={String(data.publishedListings)} hint={`${listingCount} total properties`} />
      </section>
      <section className="dash-grid-2">
        <article className="dash-panel">
          <h2 className="dash-panel-title">Booking trends</h2>
          <BarChart data={data.bookingTrend} />
        </article>
        <article className="dash-panel">
          <h2 className="dash-panel-title">Recent activity</h2>
          <ActivityFeed items={data.reservationActivity} />
        </article>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/list-property" className="btn-primary">List a new property</Link>
        <Link href="/host/listings" className="btn-secondary">Manage listings</Link>
      </div>
    </DashboardShell>
  );
}
