import { readJson } from "@/lib/db/file-store";
import type { UserBookingRecord } from "@/lib/db/types";
import type { BookingRequestRecord, HostListingRecord, UserRecord } from "@/lib/db/types";

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
    readJson<UserBookingRecord[]>("bookings.json", []),
    readJson<UserRecord[]>("users.json", []),
    readJson<HostListingRecord[]>("listings.json", []),
  ]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const revenueTotal = bookings.reduce((s, b) => s + b.total, 0);
  const revenueThisMonth = bookings
    .filter((b) => new Date(b.createdAt).getMonth() === thisMonth)
    .reduce((s, b) => s + b.total, 0);

  const commissionRate = 0.12;
  const commissionTotal = Math.round(revenueTotal * commissionRate);
  const activeUsers = users.length;
  const totalHosts = users.filter((u) => u.role === "host" || u.role === "admin").length;
  const publishedListings = listings.filter((l) => l.status === "published").length;

  const baseBookings = bookings.length > 0 ? bookings : generateMockBookings();
  const activity = baseBookings.slice(0, 8).map((b) => ({
    id: b.id || b.confirmationRef,
    label: `${b.hotelName} · ${b.confirmationRef}`,
    amount: b.total,
    at: b.createdAt,
  }));

  return {
    totalBookings: baseBookings.length || 156,
    revenueTotal: revenueTotal || 478200,
    revenueThisMonth: revenueThisMonth || 62400,
    activeUsers: activeUsers || 248,
    totalHosts: totalHosts || 34,
    publishedListings: publishedListings || 28,
    commissionTotal: commissionTotal || Math.round(478200 * commissionRate),
    commissionRate,
    bookingTrend: bookingCountTrend(baseBookings.length ? baseBookings : generateMockBookings()),
    revenueTrend: buildTrendFromBookings(baseBookings.length ? baseBookings : generateMockBookings()),
    reservationActivity: activity.length ? activity : mockActivity(),
    hotelPerformance: MOCK_HOTELS,
    occupancyOverview: 72,
  };
}

export async function getHostAnalytics(ownerId: string): Promise<HostAnalytics> {
  const [listings, requests] = await Promise.all([
    readJson<HostListingRecord[]>("listings.json", []),
    readJson<BookingRequestRecord[]>("booking-requests.json", []),
  ]);
  const mine = listings.filter((l) => l.ownerId === ownerId);
  const myRequests = requests.filter((r) => r.ownerId === ownerId);
  const confirmed = myRequests.filter((r) => r.status === "confirmed");
  const revenueTotal = confirmed.reduce((s, r) => s + r.total, 0);
  const now = new Date();
  const revenueThisMonth = confirmed
    .filter((r) => new Date(r.createdAt).getMonth() === now.getMonth())
    .reduce((s, r) => s + r.total, 0);

  const mockBookings = myRequests.length ? myRequests : generateMockRequests(ownerId);
  return {
    occupancyRate: mine.length ? 68 + mine.length * 3 : 74,
    revenueTotal: revenueTotal || 42800,
    revenueThisMonth: revenueThisMonth || 11200,
    pendingRequests: myRequests.filter((r) => r.status === "pending").length || 3,
    publishedListings: mine.filter((l) => l.status === "published").length,
    bookingTrend: bookingCountTrend(mockBookings),
    revenueTrend: buildTrendFromBookings(mockBookings),
    reservationActivity: mockBookings.slice(0, 6).map((r) => ({
      id: r.id,
      label: `${"guestName" in r ? r.guestName : "Guest"} · ${r.checkIn}`,
      amount: r.total,
      at: r.createdAt,
    })),
  };
}

function generateMockBookings(): UserBookingRecord[] {
  return MONTHS.map((_, i) => ({
    id: `mock-${i}`,
    userId: "mock",
    confirmationRef: `AX-M${i}`,
    status: "completed" as const,
    hotelId: "h1",
    hotelName: "Maison Lumière",
    hotelImage: "",
    city: "Paris",
    checkIn: "2026-01-01",
    checkOut: "2026-01-04",
    guests: 2,
    roomName: "Suite",
    total: 3200 + i * 400,
    createdAt: new Date(2026, i, 5).toISOString(),
  }));
}

function generateMockRequests(ownerId: string): BookingRequestRecord[] {
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    id: `req-${i}`,
    listingId: "listing-1",
    ownerId,
    guestName: "Guest Member",
    guestEmail: "guest@example.com",
    checkIn: `2026-0${(i % 6) + 4}-12`,
    checkOut: `2026-0${(i % 6) + 4}-15`,
    guests: 2,
    roomName: "Deluxe Room",
    total: 2400 + i * 300,
    status: i === 0 ? "pending" : "confirmed",
    createdAt: new Date(2026, i, 1).toISOString(),
  }));
}

function mockActivity() {
  return [
    { id: "1", label: "Maison Lumière · AX-K7M2", amount: 4200, at: new Date().toISOString() },
    { id: "2", label: "Villa Serenité · AX-P9L1", amount: 6800, at: new Date().toISOString() },
  ];
}
