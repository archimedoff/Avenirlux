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
  console.log(`Seeded ${AMENITY_IDS.length} amenities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
