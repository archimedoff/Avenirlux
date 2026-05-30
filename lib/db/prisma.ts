import "server-only";

import { PrismaClient } from "@prisma/client";

import { applyDatabaseUrlsToEnv } from "@/lib/db/compose-database-urls";

try {
  if (
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    process.env.DATABASE_URL?.includes("[YOUR-PASSWORD]")
  ) {
    applyDatabaseUrlsToEnv();
  }
} catch {
  /* DATABASE_URL may already be fully configured */
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
