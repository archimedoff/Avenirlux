import "server-only";

import { prisma } from "@/lib/db/prisma";

let cachedPlatformHostId: string | null = null;

export async function getPlatformHostId(): Promise<string> {
  if (cachedPlatformHostId) return cachedPlatformHostId;

  const adminEmails = (process.env.ADMIN_EMAILS ?? "admin@avenirlux.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const admin = await prisma.user.findFirst({
    where: { email: { in: adminEmails, mode: "insensitive" }, role: { in: ["admin", "host"] } },
    select: { id: true },
  });
  if (admin) {
    cachedPlatformHostId = admin.id;
    return admin.id;
  }

  const demoHost = await prisma.user.findFirst({
    where: { email: "host@avenirlux.demo" },
    select: { id: true },
  });
  if (demoHost) {
    cachedPlatformHostId = demoHost.id;
    return demoHost.id;
  }

  const fallback = await prisma.user.findFirst({ where: { role: "host" }, select: { id: true } });
  if (!fallback) throw new Error("No platform host available for external bookings");
  cachedPlatformHostId = fallback.id;
  return fallback.id;
}
