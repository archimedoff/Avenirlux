import type { UserRole } from "@/lib/db/types";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@avenirlux.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function resolveRole(email: string, storedRole?: UserRole): UserRole {
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return "admin";
  return storedRole ?? "guest";
}

export function canAccessAdmin(role: UserRole) {
  return role === "admin";
}

export function canAccessHost(role: UserRole) {
  return role === "host" || role === "admin";
}
