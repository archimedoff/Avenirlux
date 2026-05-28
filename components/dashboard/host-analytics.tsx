"use client";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LineChart } from "@/components/dashboard/line-chart";
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

export function HostAnalyticsView({ data }: { data: HostAnalytics }) {
  return (
    <DashboardShell title="Analytics" subtitle="Occupancy, revenue, and reservation patterns" nav={hostNav} badge="Host">
      <section className="dash-grid-stats">
        <StatCard label="Occupancy rate" value={formatPercent(data.occupancyRate)} accent />
        <StatCard label="Total revenue" value={formatCurrency(data.revenueTotal)} />
        <StatCard label="This month" value={formatCurrency(data.revenueThisMonth)} />
        <StatCard label="Pending" value={String(data.pendingRequests)} />
      </section>
      <section className="dash-grid-2">
        <article className="dash-panel">
          <h2 className="dash-panel-title">Revenue</h2>
          <LineChart data={data.revenueTrend} />
        </article>
        <article className="dash-panel">
          <h2 className="dash-panel-title">Bookings</h2>
          <BarChart data={data.bookingTrend} />
        </article>
      </section>
      <article className="dash-panel">
        <h2 className="dash-panel-title">Reservation activity</h2>
        <ActivityFeed items={data.reservationActivity} />
      </article>
    </DashboardShell>
  );
}
