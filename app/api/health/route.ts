import { NextResponse } from "next/server";

import { isProduction, isEmailConfigured } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { isStorageConfigured } from "@/lib/storage/config";
import { isStripeConfigured } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "degraded" | "missing"> = {
    database: "missing",
    stripe: isStripeConfigured() ? "ok" : isProduction() ? "missing" : "degraded",
    email: isEmailConfigured() ? "ok" : "degraded",
    storage: isStorageConfigured() ? "ok" : "degraded",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "missing";
  }

  const healthy = checks.database === "ok";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      checks,
      ts: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
