import { listingsRepository } from "@/lib/db/repositories/listings-repository";
import { bookingRequestsRepository } from "@/lib/db/repositories/booking-requests-repository";
import { prisma } from "@/lib/db/prisma";


export type AnalyticsPoint = { label: string; value: number };

export type AdminAnalytics = {
  totalBookings: number;
  revenueTotal: number;
  revenueThisMonth: number;
  activeUsers: number;
  totalHosts: number;
  publishedListings: number;
  pendingListings: number;
  emailQueuePending: number;
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

function buildHotelPerformance(bookings: { externalHotelId: string | null; hotelName: string | null; total: number }[]) {
  const map = new Map<string, { name: string; bookings: number; revenue: number }>();
  for (const b of bookings) {
    const id = b.externalHotelId ?? "unknown";
    const name = b.hotelName ?? "Stay";
    const row = map.get(id) ?? { name, bookings: 0, revenue: 0 };
    row.bookings += 1;
    row.revenue += b.total;
    map.set(id, row);
  }
  return [...map.entries()]
    .map(([hotelId, v]) => ({
      hotelId,
      name: v.name,
      bookings: v.bookings,
      revenue: v.revenue,
      occupancy: Math.min(95, 40 + v.bookings * 4),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [bookings, users, listings, emailPending] = await Promise.all([
    prisma.booking.findMany({ where: { kind: "guest_booking", status: { in: ["upcoming", "completed", "confirmed"] } } }),
    prisma.user.findMany(),
    prisma.property.findMany(),
    prisma.emailNotification.count({ where: { status: "queued" } }),
  ]);
  const bookingRows = bookings.map((b) => ({
    total: b.total,
    createdAt: b.createdAt.toISOString(),
    id: b.id,
    confirmationRef: b.confirmationRef ?? b.id,
    hotelName: b.hotelName ?? "Stay",
    externalHotelId: b.externalHotelId,
  }));
  const now = new Date();
  const thisMonth = now.getMonth();
  const revenueTotal = bookingRows.reduce((s, b) => s + b.total, 0);
  const revenueThisMonth = bookingRows.filter((b) => new Date(b.createdAt).getMonth() === thisMonth).reduce((s, b) => s + b.total, 0);
  const commissionRate = 0.12;
  const hotelPerformance = buildHotelPerformance(bookings);
  const occupancyOverview = hotelPerformance.length
    ? Math.round(hotelPerformance.reduce((s, h) => s + h.occupancy, 0) / hotelPerformance.length)
    : 0;

  return {
    totalBookings: bookingRows.length,
    revenueTotal,
    revenueThisMonth,
    activeUsers: users.length,
    totalHosts: users.filter((u) => u.role === "host" || u.role === "admin").length,
    publishedListings: listings.filter((l) => l.published).length,
    pendingListings: listings.filter((l) => !l.published).length,
    emailQueuePending: emailPending,
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
    hotelPerformance,
    occupancyOverview,
  };
}

export async function getHostAnalytics(ownerId: string): Promise<HostAnalytics> {
  const mine = await listingsRepository.listByOwner(ownerId);
  const myRequests = await bookingRequestsRepository.listByOwner(ownerId);
  const paid = myRequests.filter((r) => r.status === "confirmed" || r.kind === "guest_booking");
  const revenueTotal = paid.reduce((s, r) => s + r.total, 0);
  const now = new Date();
  const revenueThisMonth = paid.filter((r) => new Date(r.createdAt).getMonth() === now.getMonth()).reduce((s, r) => s + r.total, 0);
  const confirmedCount = paid.length;
  const occupancyRate = mine.length ? Math.min(95, Math.round((confirmedCount / Math.max(mine.length * 4, 1)) * 100)) : 0;
  return {
    occupancyRate,
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
