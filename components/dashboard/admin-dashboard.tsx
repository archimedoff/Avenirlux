"use client";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LineChart } from "@/components/dashboard/line-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import type { AdminAnalytics } from "@/lib/dashboard/analytics";
import { formatCurrency, formatPercent } from "@/lib/dashboard/format";

const nav = [
  { href: "/admin", label: "Overview", icon: "◈" },
];

export function AdminDashboard({ data }: { data: AdminAnalytics }) {
  return (
    <DashboardShell title="Platform intelligence" subtitle="Reservations, revenue, and marketplace health" nav={nav} badge="Admin">
      <section className="dash-grid-stats">
        <StatCard label="Total bookings" value={String(data.totalBookings)} hint="All-time confirmed" trend="+12% vs prior" />
        <StatCard label="Revenue" value={formatCurrency(data.revenueTotal)} hint={`This month ${formatCurrency(data.revenueThisMonth)}`} accent />
        <StatCard label="Active members" value={String(data.activeUsers)} hint={`${data.totalHosts} hosts`} />
        <StatCard label="Commission" value={formatCurrency(data.commissionTotal)} hint={`${formatPercent(data.commissionRate * 100)} platform rate`} />
      </section>

      <section className="dash-grid-2">
        <article className="dash-panel">
          <h2 className="dash-panel-title">Revenue overview</h2>
          <LineChart data={data.revenueTrend} />
        </article>
        <article className="dash-panel">
          <h2 className="dash-panel-title">Booking trends</h2>
          <BarChart data={data.bookingTrend} formatValue={formatCurrency} />
        </article>
      </section>

      <section className="dash-grid-2">
        <article className="dash-panel">
          <h2 className="dash-panel-title">Reservation analytics</h2>
          <div className="mb-4 flex items-end gap-4">
            <p className="font-display text-4xl font-medium tracking-[-0.03em]">{formatPercent(data.occupancyOverview)}</p>
            <p className="pb-1 text-sm text-[var(--foreground-muted)]">Network occupancy</p>
          </div>
          <ActivityFeed items={data.reservationActivity} />
        </article>
        <article className="dash-panel">
          <h2 className="dash-panel-title">Commission overview</h2>
          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Collected</p>
              <p className="mt-1 font-display text-2xl font-medium">{formatCurrency(data.commissionTotal)}</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Published listings</p>
              <p className="mt-1 font-display text-2xl font-medium">{data.publishedListings}</p>
            </div>
            <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
              Stripe / Payoneer settlement ready — connect payout rails in production.
            </p>
          </div>
        </article>
      </section>

      <section className="dash-panel">
        <h2 className="dash-panel-title">Hotel performance</h2>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Residence</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {data.hotelPerformance.map((row) => (
                <tr key={row.hotelId}>
                  <td className="font-medium">{row.name}</td>
                  <td>{row.bookings}</td>
                  <td>{formatCurrency(row.revenue)}</td>
                  <td>
                    <span className="dash-occupancy-bar">
                      <span style={{ width: `${row.occupancy}%` }} />
                    </span>
                    <span className="ml-2 text-sm">{formatPercent(row.occupancy)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
