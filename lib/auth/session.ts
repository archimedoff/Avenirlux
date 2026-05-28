import { auth } from "@/auth";
import { resolveRole } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/db/types";
import { userRepository } from "@/lib/db/repositories/user-repository";

export async function getSessionWithRole() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await userRepository.findById(session.user.id);
  const role: UserRole = user
    ? resolveRole(user.email, user.role ?? "guest")
    : ((session.user.role as UserRole) ?? "guest");
  return { ...session, user: { ...session.user, role } };
}
