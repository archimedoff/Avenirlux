import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [users, properties, conversations] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.conversation.count(),
    ]);
    console.log("OK: connected to Supabase");
    console.log(`  users: ${users}`);
    console.log(`  properties: ${properties}`);
    console.log(`  conversations: ${conversations}`);
  } catch (e) {
    console.error("FAIL:", e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
