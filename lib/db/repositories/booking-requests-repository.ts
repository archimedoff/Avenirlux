import { randomUUID } from "crypto";

import { readJson, writeJson } from "@/lib/db/file-store";
import type { BookingRequestRecord } from "@/lib/db/types";

const FILE = "booking-requests.json";

export class FileBookingRequestsRepository {
  private async all() {
    return readJson<BookingRequestRecord[]>(FILE, []);
  }
  private async save(items: BookingRequestRecord[]) {
    await writeJson(FILE, items);
  }

  async listByOwner(ownerId: string) {
    return (await this.all()).filter((r) => r.ownerId === ownerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listByListing(listingId: string) {
    return (await this.all()).filter((r) => r.listingId === listingId);
  }

  async updateStatus(id: string, ownerId: string, status: BookingRequestRecord["status"]) {
    const items = await this.all();
    const idx = items.findIndex((r) => r.id === id && r.ownerId === ownerId);
    if (idx < 0) return null;
    items[idx] = { ...items[idx], status };
    await this.save(items);
    return items[idx];
  }

  async seedIfEmpty(ownerId: string, listingId: string) {
    const items = await this.all();
    if (items.some((r) => r.ownerId === ownerId)) return items.filter((r) => r.ownerId === ownerId);
    const demo: BookingRequestRecord[] = [
      {
        id: randomUUID(),
        listingId,
        ownerId,
        guestName: "Elena Marchetti",
        guestEmail: "elena@example.com",
        checkIn: "2026-06-14",
        checkOut: "2026-06-18",
        guests: 2,
        roomName: "Garden Suite",
        total: 4800,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        listingId,
        ownerId,
        guestName: "James Whitfield",
        guestEmail: "james@example.com",
        checkIn: "2026-05-22",
        checkOut: "2026-05-25",
        guests: 2,
        roomName: "Premier Room",
        total: 3200,
        status: "confirmed",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];
    await this.save([...items, ...demo]);
    return demo;
  }
}

export const bookingRequestsRepository = new FileBookingRequestsRepository();
