import { listingsRepository } from "@/lib/db/repositories/listings-repository";
import { bookingRequestsRepository } from "@/lib/db/repositories/booking-requests-repository";
import { prisma } from "@/lib/db/prisma";

import type { UserBookingRecord } from "@/lib/db/types";

export type AnalyticsPoint = { label: string; value: number };

export type AdminAnalytics = {
  totalBookings: number;
  revenueTotal: number;
  revenueThisMonth: number;
  activeUsers: number;
  totalHosts: number;
  publishedListings: number;
  commissionTotal: number;
  commissionRate: number;
  bookingTrend: AnalyticsPoint[];
  revenueTrend: AnalyticsPoint[];
  reservationActivity: { id: string; label: string; amount: number; at: string }[];
  hotelPerformance: { hotelId: string; name: string; bookings: number; revenue: number; occupancy: number }[];
  occupancyOverview: number;
};

export type HostAnalytics = {
  occupancyRate: number;
  revenueTotal: number;
  revenueThisMonth: number;
  pendingRequests: number;
  publishedListings: number;
  bookingTrend: AnalyticsPoint[];
  revenueTrend: AnalyticsPoint[];
  reservationActivity: { id: string; label: string; amount: number; at: string }[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(d: Date) {
  return MONTHS[d.getMonth()];
}

function buildTrendFromBookings(bookings: { total: number; createdAt: string }[]): AnalyticsPoint[] {
  const buckets = new Map<string, number>();
  MONTHS.forEach((m) => buckets.set(m, 0));
  bookings.forEach((b) => {
    const m = monthKey(new Date(b.createdAt));
    buckets.set(m, (buckets.get(m) ?? 0) + b.total);
  });
  return MONTHS.map((label) => ({ label, value: buckets.get(label) ?? 0 }));
}

function bookingCountTrend(bookings: { createdAt: string }[]): AnalyticsPoint[] {
  const buckets = new Map<string, number>();
  MONTHS.forEach((m) => buckets.set(m, 0));
  bookings.forEach((b) => {
    const m = monthKey(new Date(b.createdAt));
    buckets.set(m, (buckets.get(m) ?? 0) + 1);
  });
  return MONTHS.map((label) => ({ label, value: buckets.get(label) ?? 0 }));
}

const MOCK_HOTELS = [
  { hotelId: "h1", name: "Maison Lumière", bookings: 42, revenue: 128400, occupancy: 78 },
  { hotelId: "h2", name: "The Obsidian House", bookings: 36, revenue: 98200, occupancy: 71 },
  { hotelId: "h3", name: "Villa Serenité", bookings: 28, revenue: 86400, occupancy: 65 },
  { hotelId: "h4", name: "Amanère Tokyo", bookings: 24, revenue: 112000, occupancy: 82 },
  { hotelId: "h5", name: "Côte Azure", bookings: 19, revenue: 54000, occupancy: 58 },
];

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [bookings, users, listings] = await Promise.all([
    prisma.booking.findMany({ where: { kind: "guest_booking" } }),
    prisma.user.findMany(),
    prisma.property.findMany(),
  ]);
  const bookingRows = bookings.map((b) => ({
    total: b.total,
    createdAt: b.createdAt.toISOString(),
    id: b.id,
    confirmationRef: b.confirmationRef ?? b.id,
    hotelName: b.hotelName ?? "Stay",
  }));
  const now = new Date();
  const thisMonth = now.getMonth();
  const revenueTotal = bookingRows.reduce((s, b) => s + b.total, 0);
  const revenueThisMonth = bookingRows
    .filter((b) => new Date(b.createdAt).getMonth() === thisMonth)
    .reduce((s, b) => s + b.total, 0);
  const commissionRate = 0.12;
  return {
    totalBookings: bookingRows.length,
    revenueTotal,
    revenueThisMonth,
    activeUsers: users.length,
    totalHosts: users.filter((u) => u.role === "host" || u.role === "admin").length,
    publishedListings: listings.filter((l) => l.published).length,
    commissionTotal: Math.round(revenueTotal * commissionRate),
    commissionRate,
    bookingTrend: bookingCountTrend(bookingRows),
    revenueTrend: buildTrendFromBookings(bookingRows),
    reservationActivity: bookingRows.slice(0, 8).map((b) => ({
      id: b.id,
      label: `${b.hotelName} · ${b.confirmationRef}`,
      amount: b.total,
      at: b.createdAt,
    })),
    hotelPerformance: MOCK_HOTELS,
    occupancyOverview: 72,
  };
}

export async function getHostAnalytics(ownerId: string): Promise<HostAnalytics> {
  const mine = await listingsRepository.listByOwner(ownerId);
  const myRequests = await bookingRequestsRepository.listByOwner(ownerId);
  const confirmed = myRequests.filter((r) => r.status === "confirmed");
  const revenueTotal = confirmed.reduce((s, r) => s + r.total, 0);
  const now = new Date();
  const revenueThisMonth = confirmed
    .filter((r) => new Date(r.createdAt).getMonth() === now.getMonth())
    .reduce((s, r) => s + r.total, 0);
  return {
    occupancyRate: mine.length ? Math.min(95, 68 + mine.length * 3) : 0,
    revenueTotal,
    revenueThisMonth,
    pendingRequests: myRequests.filter((r) => r.status === "pending").length,
    publishedListings: mine.filter((l) => l.status === "published").length,
    bookingTrend: bookingCountTrend(myRequests),
    revenueTrend: buildTrendFromBookings(myRequests),
    reservationActivity: myRequests.slice(0, 6).map((r) => ({
      id: r.id,
      label: `${r.guestName} · ${r.checkIn}`,
      amount: r.total,
      at: r.createdAt,
    })),
  };
}

