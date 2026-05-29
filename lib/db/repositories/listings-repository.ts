import type { HostListingRecord, ListingStatus } from "@/lib/db/types";
import { PrismaListingsRepository } from "@/lib/db/repositories/prisma/listings-repository";

export type ListingInput = Omit<
  HostListingRecord,
  "id" | "createdAt" | "updatedAt" | "ownerId" | "status" | "commissionRate"
> & {
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

export const listingsRepository: ListingsRepository = new PrismaListingsRepository();
