import type { Account, Profile, User } from "next-auth";

import { parseOAuthName } from "@/lib/auth/parse-oauth-profile";
import { isOAuthProviderId } from "@/lib/auth/providers";
import { resolveRole } from "@/lib/auth/roles";
import { userRepository } from "@/lib/db/repositories/user-repository";
import type { PublicUser, UserRole } from "@/lib/db/types";

type SyncInput = {
  user: User;
  account: Account;
  profile?: Profile | null;
};

export type SyncOAuthResult = PublicUser & { role: UserRole };

export async function syncOAuthSignIn({ user, account, profile }: SyncInput): Promise<SyncOAuthResult | null> {
  if (!account.provider || !isOAuthProviderId(account.provider)) return null;

  const email = user.email?.toLowerCase().trim();
  if (!email) return null;

  const fromProfile = parseOAuthName(user.name ?? profile?.name ?? null);
  const synced = await userRepository.upsertOAuthUser({
    email,
    firstName: fromProfile.firstName,
    lastName: fromProfile.lastName,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    image: user.image ?? undefined,
  });

  const role = resolveRole(synced.email, synced.role ?? "guest");

  user.id = synced.id;
  user.firstName = synced.firstName;
  user.lastName = synced.lastName;
  user.role = role;
  user.name = `${synced.firstName} ${synced.lastName}`.trim();

  return { ...synced, role };
}
