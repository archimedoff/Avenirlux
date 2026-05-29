import { randomUUID } from "crypto";

import { readJson, writeJson } from "@/lib/db/file-store";
import type { HostListingRecord, ListingStatus } from "@/lib/db/types";

const FILE = "listings.json";

export type ListingInput = Omit<HostListingRecord, "id" | "createdAt" | "updatedAt" | "ownerId" | "status" | "commissionRate"> & {
  status?: ListingStatus;
};

export interface ListingsRepository {
  listByOwner(ownerId: string): Promise<HostListingRecord[]>;
  listPublished(): Promise<HostListingRecord[]>;
  listPendingReview(): Promise<HostListingRecord[]>;
  findById(id: string): Promise<HostListingRecord | null>;
  create(ownerId: string, input: ListingInput): Promise<HostListingRecord>;
  update(id: string, ownerId: string, patch: Partial<HostListingRecord>): Promise<HostListingRecord | null>;
  remove(id: string, ownerId: string): Promise<boolean>;
}

export class FileListingsRepository implements ListingsRepository {
  private async all() {
    return readJson<HostListingRecord[]>(FILE, []);
  }
  private async save(items: HostListingRecord[]) {
    await writeJson(FILE, items);
  }

  async listByOwner(ownerId: string) {
    return (await this.all()).filter((l) => l.ownerId === ownerId);
  }

  async listPublished() {
    return (await this.all()).filter((l) => l.status === "published");
  }

  async listPendingReview() {
    return (await this.all()).filter((l) => l.status === "pending_review");
  }

  async findById(id: string) {
    return (await this.all()).find((l) => l.id === id) ?? null;
  }

  async create(ownerId: string, input: ListingInput) {
    const items = await this.all();
    const now = new Date().toISOString();
    const listing: HostListingRecord = {
      id: randomUUID(),
      ownerId,
      status: input.status ?? "draft",
      commissionRate: 0.12,
      createdAt: now,
      updatedAt: now,
      name: input.name,
      city: input.city,
      country: input.country,
      location: input.location,
      description: input.description,
      image: input.image,
      gallery: input.gallery ?? [],
      amenities: input.amenities ?? [],
      categories: input.categories ?? [],
      pricePerNight: input.pricePerNight,
      rooms: input.rooms ?? [],
      coordinates: input.coordinates ?? { lat: 0, lng: 0 },
      cancellationPolicy: input.cancellationPolicy ?? "Flexible cancellation up to 7 days before arrival.",
      metadata: input.metadata,
    };
    items.push(listing);
    await this.save(items);
    return listing;
  }

  async update(id: string, ownerId: string, patch: Partial<HostListingRecord>) {
    const items = await this.all();
    const idx = items.findIndex((l) => l.id === id && l.ownerId === ownerId);
    if (idx < 0) return null;
    items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
    await this.save(items);
    return items[idx];
  }

  async remove(id: string, ownerId: string) {
    const items = await this.all();
    const next = items.filter((l) => !(l.id === id && l.ownerId === ownerId));
    if (next.length === items.length) return false;
    await this.save(next);
    return true;
  }
}

import { isDatabaseConfigured } from "@/lib/db/config";
import { PrismaListingsRepository } from "@/lib/db/repositories/prisma/listings-repository";

export const listingsRepository: ListingsRepository = isDatabaseConfigured()
  ? new PrismaListingsRepository()
  : new FileListingsRepository();
