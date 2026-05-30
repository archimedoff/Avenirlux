import { config } from "dotenv";

import { PrismaClient } from "@prisma/client";

import { applyDatabaseUrlsToEnv } from "../lib/db/compose-database-urls";

config({ path: ".env.local" });

async function main() {
  try {
    const hasUrls =
      process.env.DATABASE_URL?.startsWith("postgres") &&
      !process.env.DATABASE_URL?.includes("[YOUR-PASSWORD]");
    if (!hasUrls) applyDatabaseUrlsToEnv();
    else if (process.env.SUPABASE_DB_PASSWORD?.trim()) applyDatabaseUrlsToEnv();
  } catch (e) {
    console.error("FAIL:", e instanceof Error ? e.message : e);
    process.exit(1);
  }

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
