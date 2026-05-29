import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { AMENITY_IDS } from "../lib/listing/types";

const prisma = new PrismaClient();

async function main() {
  for (const id of AMENITY_IDS) {
    await prisma.amenity.upsert({
      where: { id },
      create: { id, label: id.replace(/_/g, " ") },
      update: { label: id.replace(/_/g, " ") },
    });
  }

  const hostEmail = "host@avenirlux.demo";
  const host = await prisma.user.upsert({
    where: { email: hostEmail },
    create: {
      email: hostEmail,
      passwordHash: "",
      firstName: "Avenir",
      lastName: "Host",
      role: "host",
    },
    update: { role: "host" },
  });

  const slug = "maison-azure-demo";
  const existing = await prisma.property.findUnique({ where: { slug } });
  if (!existing) {
    const property = await prisma.property.create({
      data: {
        hostId: host.id,
        title: "Maison Azure",
        subtitle: "A calm waterfront residence for discerning travelers",
        slug,
        description:
          "Sunlit interiors, private terrace, and discreet concierge service in the heart of the city.",
        propertyType: "boutique_stay",
        status: "published",
        published: true,
        publishedAt: new Date(),
        country: "France",
        city: "Paris",
        address: "12 Quai des Grands Augustins",
        latitude: 48.8566,
        longitude: 2.3522,
        guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        basePrice: 890,
        currency: "EUR",
        coverImage:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        featured: true,
        categories: ["boutique_stay", "resort"],
      },
    });
    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 0,
        isCover: true,
      },
    });
    await prisma.propertyAmenity.createMany({
      data: [
        { propertyId: property.id, amenityId: "wifi" },
        { propertyId: property.id, amenityId: "pool" },
        { propertyId: property.id, amenityId: "spa" },
      ],
      skipDuplicates: true,
    });
  }

  console.log(`Seeded amenities + demo host/property`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
