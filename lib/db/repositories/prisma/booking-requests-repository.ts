import { randomUUID } from "crypto";
import type { BookingRequestRecord } from "@/lib/db/types";
import { prisma } from "@/lib/db/prisma";

function toRequest(row: {
  id: string;
  propertyId: string | null;
  hostId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomName: string;
  total: number;
  status: string;
  createdAt: Date;
}): BookingRequestRecord {
  return {
    id: row.id,
    listingId: row.propertyId ?? "",
    ownerId: row.hostId,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    guests: row.guests,
    roomName: row.roomName,
    total: row.total,
    status: row.status as BookingRequestRecord["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaBookingRequestsRepository {
  async listByOwner(ownerId: string) {
    const rows = await prisma.booking.findMany({
      where: { hostId: ownerId, kind: "host_request" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toRequest);
  }

  async listByListing(listingId: string) {
    const rows = await prisma.booking.findMany({
      where: { propertyId: listingId, kind: "host_request" },
    });
    return rows.map(toRequest);
  }

  async updateStatus(id: string, ownerId: string, status: BookingRequestRecord["status"]) {
    const row = await prisma.booking.findFirst({ where: { id, hostId: ownerId, kind: "host_request" } });
    if (!row) return null;
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    return toRequest(updated);
  }

  async seedIfEmpty(ownerId: string, listingId: string) {
    const existing = await this.listByOwner(ownerId);
    if (existing.length) return existing;
    const demo = [
      {
        id: randomUUID(),
        kind: "host_request" as const,
        status: "pending" as const,
        propertyId: listingId,
        hostId: ownerId,
        guestName: "Elena Marchetti",
        guestEmail: "elena@example.com",
        checkIn: "2026-06-14",
        checkOut: "2026-06-18",
        guests: 2,
        roomName: "Garden Suite",
        total: 4800,
      },
      {
        id: randomUUID(),
        kind: "host_request" as const,
        status: "confirmed" as const,
        propertyId: listingId,
        hostId: ownerId,
        guestName: "James Whitfield",
        guestEmail: "james@example.com",
        checkIn: "2026-05-22",
        checkOut: "2026-05-25",
        guests: 2,
        roomName: "Premier Room",
        total: 3200,
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
    ];
    for (const d of demo) {
      await prisma.booking.create({ data: d });
    }
    return this.listByOwner(ownerId);
  }
}
