import type { ListingInput, ListingsRepository } from "@/lib/db/repositories/listings-repository";
import type { HostListingRecord } from "@/lib/db/types";
import { prisma } from "@/lib/db/prisma";
import {
  appStatusToPrisma,
  propertyToHostListing,
  slugifyTitle,
  type PropertyWithRelations,
} from "@/lib/db/mappers/property-mapper";
import type { ListingMetadata } from "@/lib/listing/types";
import { sanitizeImageUrls } from "@/lib/storage/upload-property-image";

const include = {
  images: { orderBy: { sortOrder: "asc" as const } },
  amenities: { include: { amenity: true } },
};

async function syncAmenities(propertyId: string, amenityIds: string[]) {
  await prisma.propertyAmenity.deleteMany({ where: { propertyId } });
  if (!amenityIds.length) return;
  const unique = [...new Set(amenityIds.map((a) => a.toLowerCase()))];
  for (const id of unique) {
    await prisma.amenity.upsert({
      where: { id },
      create: { id, label: id.replace(/_/g, " ") },
      update: {},
    });
  }
  await prisma.propertyAmenity.createMany({
    data: unique.map((amenityId) => ({ propertyId, amenityId })),
    skipDuplicates: true,
  });
}

async function syncImages(propertyId: string, coverImage: string, gallery: string[]) {
  await prisma.propertyImage.deleteMany({ where: { propertyId } });
  const safeCover = sanitizeImageUrls([coverImage])[0] ?? "";
  const safeGallery = sanitizeImageUrls(gallery);
  const urls = [safeCover, ...safeGallery.filter((u) => u && u !== safeCover)].filter(Boolean);
  if (!urls.length) return;
  await prisma.propertyImage.createMany({
    data: urls.map((url, index) => ({
      propertyId,
      url,
      sortOrder: index,
      isCover: index === 0,
    })),
  });
}

function inputToPropertyData(ownerId: string, input: ListingInput, existingSlug?: string) {
  const meta = (input.metadata ?? {}) as ListingMetadata;
  const title = input.name;
  const slug = existingSlug ?? `${slugifyTitle(title)}-${Date.now().toString(36)}`;
  const status = appStatusToPrisma(input.status);
  const published = status === "published";

  return {
    hostId: ownerId,
    title,
    subtitle: meta.tagline ?? meta.shortDescription ?? null,
    slug,
    description: input.description,
    propertyType: (meta.propertyType ?? input.categories?.[0] ?? "hotel") as never,
    status,
    published,
    publishedAt: published ? new Date() : null,
    country: input.country,
    city: input.city,
    address: meta.address ?? input.location ?? "",
    district: meta.district ?? input.location ?? null,
    landmarks: meta.landmarks ?? null,
    latitude: input.coordinates?.lat ?? 0,
    longitude: input.coordinates?.lng ?? 0,
    guests: meta.guestCapacity ?? 2,
    bedrooms: meta.bedrooms ?? 1,
    beds: meta.beds ?? 1,
    bathrooms: meta.bathrooms ?? 1,
    squareMeters: meta.squareMeters ?? null,
    floor: meta.floor ?? null,
    basePrice: input.pricePerNight,
    cleaningFee: meta.cleaningFee ?? 0,
    weekendPrice: meta.weekendPrice ?? null,
    currency: meta.currency ?? "USD",
    coverImage: input.image,
    featured: false,
    cancellationPolicy: input.cancellationPolicy,
    commissionRate: 0.12,
    categories: input.categories ?? [],
    roomsJson: input.rooms ?? [],
    metadataJson: meta,
    unavailableDates: meta.unavailableDates ?? [],
    minNights: meta.minNights ?? 1,
    instantBooking: meta.instantBooking ?? false,
  };
}

export class PrismaListingsRepository implements ListingsRepository {
  private async load(id: string) {
    return prisma.property.findUnique({ where: { id }, include }) as Promise<PropertyWithRelations | null>;
  }

  async listByOwner(ownerId: string) {
    const rows = await prisma.property.findMany({
      where: { hostId: ownerId },
      include,
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => propertyToHostListing(r as PropertyWithRelations));
  }

  async listPublished() {
    const rows = await prisma.property.findMany({
      where: { published: true, status: "published" },
      include,
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => propertyToHostListing(r as PropertyWithRelations));
  }

  async listPendingReview() {
    const rows = await prisma.property.findMany({
      where: { status: "pending_review" },
      include,
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => propertyToHostListing(r as PropertyWithRelations));
  }

  async findById(id: string) {
    const row = await this.load(id);
    return row ? propertyToHostListing(row) : null;
  }

  async create(ownerId: string, input: ListingInput) {
    const data = inputToPropertyData(ownerId, input);
    const property = await prisma.property.create({ data });
    await syncImages(property.id, input.image, input.gallery ?? []);
    await syncAmenities(property.id, input.amenities ?? []);
    const loaded = await this.load(property.id);
    return propertyToHostListing(loaded!);
  }

  async update(id: string, ownerId: string, patch: Partial<HostListingRecord>) {
    const existing = await prisma.property.findFirst({ where: { id, hostId: ownerId } });
    if (!existing) return null;

    const meta = (patch.metadata ?? existing.metadataJson ?? {}) as ListingMetadata;
    const nextStatus = patch.status ? appStatusToPrisma(patch.status) : existing.status;
    const goingLive = patch.status === "published";
    const goingDraft = patch.status === "draft" || patch.status === "pending_review";
    const published = goingLive ? true : goingDraft ? false : existing.published;
    const propertyType = meta.propertyType ?? existing.propertyType;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: patch.name ?? existing.title,
        description: patch.description ?? existing.description,
        propertyType: propertyType as never,
        city: patch.city ?? existing.city,
        country: patch.country ?? existing.country,
        address: meta.address ?? patch.location ?? existing.address,
        district: meta.district ?? patch.location ?? existing.district,
        coverImage: patch.image !== undefined ? sanitizeImageUrls([patch.image])[0] ?? "" : existing.coverImage,
        basePrice: patch.pricePerNight ?? existing.basePrice,
        cancellationPolicy: patch.cancellationPolicy ?? existing.cancellationPolicy,
        categories: patch.categories ?? existing.categories,
        roomsJson: (patch.rooms ?? existing.roomsJson) as object,
        metadataJson: (Object.keys(meta).length ? meta : existing.metadataJson) as object,
        unavailableDates: meta.unavailableDates ?? existing.unavailableDates,
        minNights: meta.minNights ?? existing.minNights,
        instantBooking: meta.instantBooking ?? existing.instantBooking,
        status: nextStatus,
        published: published && nextStatus === "published",
        publishedAt:
          published && nextStatus === "published"
            ? existing.publishedAt ?? new Date()
            : goingDraft
              ? null
              : existing.publishedAt,
      },
    });

    if (patch.image !== undefined || patch.gallery !== undefined) {
      await syncImages(updated.id, patch.image ?? updated.coverImage, patch.gallery ?? []);
    }
    if (patch.amenities) {
      await syncAmenities(updated.id, patch.amenities);
    }

    const loaded = await this.load(updated.id);
    return propertyToHostListing(loaded!);
  }

  async remove(id: string, ownerId: string) {
    const result = await prisma.property.deleteMany({ where: { id, hostId: ownerId } });
    return result.count > 0;
  }
}
