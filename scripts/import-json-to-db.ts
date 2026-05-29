import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * One-time import from data/*.json into Supabase (run after db:push).
 * Usage: npm run db:import
 */
import { readFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data");

async function readData<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(dataDir, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function main() {
  type UserRow = {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    profile?: { phone?: string; country?: string; avatarUrl?: string };
    conciergePreferences?: {
      contactChannel?: string;
      preferredLanguage?: string;
      dietaryNotes?: string;
      transportNotes?: string;
    };
    oauthAccounts?: object;
    createdAt: string;
  };

  const users = await readData<UserRow[]>("users.json", []);
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      create: {
        id: u.id,
        email: u.email.toLowerCase(),
        passwordHash: u.passwordHash || (await bcrypt.hash("changeme", 12)),
        firstName: u.firstName,
        lastName: u.lastName,
        role: (u.role as "guest") ?? "guest",
        phone: u.profile?.phone,
        country: u.profile?.country,
        avatarUrl: u.profile?.avatarUrl,
        conciergeContactChannel: u.conciergePreferences?.contactChannel ?? "email",
        conciergePreferredLanguage: u.conciergePreferences?.preferredLanguage ?? "English",
        conciergeDietaryNotes: u.conciergePreferences?.dietaryNotes,
        conciergeTransportNotes: u.conciergePreferences?.transportNotes,
        oauthAccounts: u.oauthAccounts ?? undefined,
        createdAt: new Date(u.createdAt),
      },
      update: {},
    });
  }
  console.log(`Imported ${users.length} users`);

  type ListingRow = {
    id: string;
    ownerId: string;
    status: string;
    name: string;
    city: string;
    country: string;
    location: string;
    description: string;
    image: string;
    gallery: string[];
    amenities: string[];
    categories: string[];
    pricePerNight: number;
    rooms: object[];
    coordinates: { lat: number; lng: number };
    cancellationPolicy: string;
    metadata?: object;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };

  const listings = await readData<ListingRow[]>("listings.json", []);
  for (const l of listings) {
    const slug = `${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${l.id.slice(0, 8)}`;
    const published = l.status === "published";
    const property = await prisma.property.upsert({
      where: { slug },
      create: {
        id: l.id,
        hostId: l.ownerId,
        title: l.name,
        slug,
        description: l.description,
        propertyType: (l.categories[0] ?? "hotel") as never,
        status: l.status as never,
        published,
        publishedAt: l.publishedAt ? new Date(l.publishedAt) : published ? new Date() : null,
        country: l.country,
        city: l.city,
        address: l.location,
        district: l.location,
        latitude: l.coordinates?.lat ?? 0,
        longitude: l.coordinates?.lng ?? 0,
        basePrice: l.pricePerNight,
        coverImage: l.image,
        categories: l.categories,
        roomsJson: l.rooms,
        metadataJson: l.metadata ?? undefined,
        cancellationPolicy: l.cancellationPolicy,
        createdAt: new Date(l.createdAt),
        updatedAt: new Date(l.updatedAt),
      },
      update: { title: l.name, status: l.status as never, published },
    });

    if (l.image || l.gallery?.length) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: property.id } });
      const urls = [l.image, ...(l.gallery ?? [])].filter(Boolean);
      await prisma.propertyImage.createMany({
        data: urls.map((url, i) => ({ propertyId: property.id, url, sortOrder: i, isCover: i === 0 })),
      });
    }

    for (const amenityId of l.amenities ?? []) {
      const id = amenityId.toLowerCase().replace(/\s+/g, "_");
      await prisma.amenity.upsert({ where: { id }, create: { id, label: amenityId }, update: {} });
      await prisma.propertyAmenity.upsert({
        where: { propertyId_amenityId: { propertyId: property.id, amenityId: id } },
        create: { propertyId: property.id, amenityId: id },
        update: {},
      });
    }
  }
  console.log(`Imported ${listings.length} listings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
