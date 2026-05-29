import type { User } from "@prisma/client";
import type { ConciergePreferences, OAuthProviderId, PublicUser, UserRecord, UserRole } from "@/lib/db/types";

export function userToRecord(user: User): UserRecord {
  const oauthAccounts = user.oauthAccounts as UserRecord["oauthAccounts"] | null;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as UserRole,
    createdAt: user.createdAt.toISOString(),
    profile: {
      phone: user.phone ?? undefined,
      country: user.country ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    },
    conciergePreferences: {
      contactChannel: user.conciergeContactChannel as ConciergePreferences["contactChannel"],
      preferredLanguage: user.conciergePreferredLanguage,
      dietaryNotes: user.conciergeDietaryNotes ?? undefined,
      transportNotes: user.conciergeTransportNotes ?? undefined,
    },
    oauthAccounts: oauthAccounts ?? undefined,
  };
}

export function userToPublic(user: User): PublicUser {
  const { passwordHash: _, ...rest } = userToRecord(user);
  return rest;
}

export function oauthPatch(
  provider: OAuthProviderId,
  accountId: string,
  existing?: UserRecord["oauthAccounts"]
): UserRecord["oauthAccounts"] {
  return {
    ...(existing ?? {}),
    [provider]: { accountId, linkedAt: new Date().toISOString() },
  };
}
