import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { propertyToHotel, type PropertyWithRelations } from "@/lib/db/mappers/property-mapper";
import type { Hotel } from "@/lib/hotel-types";

const propertyInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  amenities: { include: { amenity: true } },
};

export type MarketplaceSearchQuery = {
  city?: string;
  propertyType?: string;
  guests?: number;
  amenities?: string[];
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
};

export async function searchPublishedProperties(query: MarketplaceSearchQuery): Promise<Hotel[]> {

  const where: Prisma.PropertyWhereInput = {
    published: true,
    status: "published",
  };

  if (query.city?.trim()) {
    where.city = { contains: query.city.trim(), mode: "insensitive" };
  }

  if (query.propertyType?.trim()) {
    const pt = query.propertyType.trim().toLowerCase();
    where.OR = [{ propertyType: pt as never }, { categories: { has: pt } }];
  }

  if (query.guests && query.guests > 0) {
    where.guests = { gte: query.guests };
  }

  if (query.featuredOnly) {
    where.featured = true;
  }

  if (query.amenities?.length) {
    where.amenities = {
      some: {
        amenityId: { in: query.amenities.map((a) => a.toLowerCase().replace(/\s+/g, "_")) },
      },
    };
  }

  const rows = await prisma.property.findMany({
    where,
    include: propertyInclude,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: query.limit ?? 24,
    skip: query.offset ?? 0,
  });

  return rows.map((r) => propertyToHotel(r as PropertyWithRelations));
}

export async function getPublishedPropertyById(publicId: string): Promise<Hotel | null> {
  const { fromPublicPropertyId } = await import("@/lib/properties/ids");
  const id = fromPublicPropertyId(publicId);
  const row = await prisma.property.findFirst({
    where: { id, published: true, status: "published" },
    include: propertyInclude,
  });
  if (!row) return null;
  return propertyToHotel(row as PropertyWithRelations);
}

export async function getSimilarPublishedProperties(
  publicId: string,
  city: string,
  limit = 6
): Promise<Hotel[]> {
  const { fromPublicPropertyId } = await import("@/lib/properties/ids");
  const id = fromPublicPropertyId(publicId);
  const rows = await prisma.property.findMany({
    where: {
      published: true,
      status: "published",
      city: { equals: city, mode: "insensitive" },
      NOT: { id },
    },
    include: propertyInclude,
    take: limit,
  });
  return rows.map((r) => propertyToHotel(r as PropertyWithRelations));
}
