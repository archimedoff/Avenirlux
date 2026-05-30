import type { Property, PropertyImage, PropertyAmenity, Amenity, PropertyType as PrismaPropertyType, ListingStatus } from "@prisma/client";
import type { HostListingRecord, ListingStatus as AppListingStatus } from "@/lib/db/types";
import type { Hotel, HotelTypeLabel, LuxuryCategory, Room } from "@/lib/hotel-types";
import type { ListingMetadata, PropertyType } from "@/lib/listing/types";
import { toPublicPropertyId } from "@/lib/properties/ids";

export type PropertyWithRelations = Property & {
  images: PropertyImage[];
  amenities: (PropertyAmenity & { amenity: Amenity })[];
};

const PROPERTY_TYPE_TO_HOTEL: Record<string, HotelTypeLabel> = {
  hotel: "Hotel",
  apartment: "Residence",
  studio: "Boutique",
  villa: "Villa",
  penthouse: "Residence",
  guest_house: "Boutique",
  resort_villa: "Villa",
};

function prismaStatusToApp(status: ListingStatus): AppListingStatus {
  return status as AppListingStatus;
}

function appStatusToPrisma(status?: AppListingStatus): ListingStatus {
  return (status ?? "draft") as ListingStatus;
}

function amenityIds(rows: PropertyWithRelations["amenities"]): string[] {
  return rows.map((r) => r.amenityId);
}

function amenityLabels(rows: PropertyWithRelations["amenities"]): string[] {
  return rows.map((r) => r.amenity.label);
}

function galleryUrls(property: PropertyWithRelations): string[] {
  const sorted = [...property.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const urls = sorted.map((i) => i.url).filter(Boolean);
  if (urls.length) return urls;
  return property.coverImage ? [property.coverImage] : [];
}

export function propertyToHostListing(property: PropertyWithRelations): HostListingRecord {
  const metadata = (property.metadataJson ?? undefined) as ListingMetadata | undefined;
  const rooms = (property.roomsJson as Room[]) ?? [];
  const location = property.district || property.address || property.city;

  return {
    id: property.id,
    ownerId: property.hostId,
    status: prismaStatusToApp(property.status),
    name: property.title,
    city: property.city,
    country: property.country,
    location,
    description: property.description,
    image: property.coverImage || galleryUrls(property)[0] || "",
    gallery: galleryUrls(property),
    amenities: amenityIds(property.amenities),
    categories: property.categories.length ? property.categories : [property.propertyType],
    pricePerNight: property.basePrice,
    rooms,
    coordinates: { lat: property.latitude, lng: property.longitude },
    cancellationPolicy: property.cancellationPolicy,
    commissionRate: property.commissionRate,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    publishedAt: property.publishedAt?.toISOString(),
    metadata: metadata
      ? {
          ...metadata,
          propertyType: (metadata.propertyType ?? property.propertyType) as PropertyType,
          address: metadata.address ?? property.address,
          district: metadata.district ?? property.district ?? undefined,
          cleaningFee: metadata.cleaningFee ?? property.cleaningFee,
          currency: metadata.currency ?? property.currency,
        }
      : {
          propertyType: property.propertyType as PropertyType,
          guestCapacity: property.guests,
          bedrooms: property.bedrooms,
          beds: property.beds,
          bathrooms: property.bathrooms,
          squareMeters: property.squareMeters ?? undefined,
          address: property.address,
          district: property.district ?? undefined,
          cleaningFee: property.cleaningFee,
          currency: property.currency,
        },
  };
}

function mapCategories(categories: string[]): LuxuryCategory[] {
  const allowed: LuxuryCategory[] = ["beachfront", "spa", "villa", "resort", "penthouse"];
  return categories.filter((c): c is LuxuryCategory => allowed.includes(c as LuxuryCategory));
}

export function propertyToHotel(property: PropertyWithRelations): Hotel {
  const gallery = galleryUrls(property);
  const rooms = ((property.roomsJson as Room[]) ?? []).length
    ? (property.roomsJson as Room[])
    : [
        {
          id: `${property.id}-default`,
          name: "Residence",
          description: property.subtitle || property.description.slice(0, 120),
          pricePerNight: property.basePrice,
          maxGuests: property.guests,
        },
      ];

  const hotelType = PROPERTY_TYPE_TO_HOTEL[property.propertyType] ?? "Hotel";
  const tagline = property.subtitle || `A private ${property.propertyType.replace(/_/g, " ")} in ${property.city}.`;

  return {
    id: toPublicPropertyId(property.id),
    name: property.title,
    location: property.district || property.address || property.city,
    city: property.city,
    country: property.country,
    hotelType,
    starRating: 5,
    pricePerNight: property.basePrice,
    rating: 4.9,
    reviews: 0,
    image: property.coverImage || gallery[0] || "",
    gallery,
    amenities: amenityLabels(property.amenities),
    categories: mapCategories(property.categories),
    coordinates: { lat: property.latitude, lng: property.longitude },
    description: property.description,
    reviewsSummary: [],
    availability: "available",
    rooms,
    experiences: ["Private concierge", "Curated local experiences", "Priority reservations"],
    cancellationPolicy: property.cancellationPolicy,
    poeticTagline: tagline,
  };
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "residence";
}

export { appStatusToPrisma, prismaStatusToApp };
export type { PrismaPropertyType };
