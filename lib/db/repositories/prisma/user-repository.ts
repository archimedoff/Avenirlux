import bcrypt from "bcryptjs";
import type { UserRepository } from "@/lib/db/repositories/user-repository";
import type { ConciergePreferences, OAuthProviderId, PublicUser, UserProfile, UserRecord, UserRole } from "@/lib/db/types";
import { prisma } from "@/lib/db/prisma";
import { oauthPatch, userToPublic, userToRecord } from "@/lib/db/mappers/user-mapper";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    return user ? userToRecord(user) : null;
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? userToRecord(user) : null;
  }

  async create(input: { email: string; password: string; firstName: string; lastName: string; role?: UserRole }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase().trim() } });
    if (existing) throw new Error("EMAIL_EXISTS");
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(input.password, 12),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        role: input.role ?? "guest",
      },
    });
    return userToPublic(user);
  }

  async updateProfile(id: string, profile: Partial<UserProfile>) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        phone: profile.phone,
        country: profile.country,
        avatarUrl: profile.avatarUrl,
      },
    });
    return userToPublic(user);
  }

  async updateConcierge(id: string, prefs: Partial<ConciergePreferences>) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        conciergeContactChannel: prefs.contactChannel,
        conciergePreferredLanguage: prefs.preferredLanguage,
        conciergeDietaryNotes: prefs.dietaryNotes,
        conciergeTransportNotes: prefs.transportNotes,
      },
    });
    return userToPublic(user);
  }

  async verifyPassword(user: UserRecord, password: string) {
    if (!this.hasPassword(user)) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  hasPassword(user: UserRecord) {
    return Boolean(user.passwordHash?.length);
  }

  async upsertOAuthUser(input: {
    email: string;
    firstName: string;
    lastName: string;
    provider: OAuthProviderId;
    providerAccountId: string;
    image?: string;
  }) {
    const email = input.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const record = userToRecord(existing);
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          oauthAccounts: oauthPatch(input.provider, input.providerAccountId, record.oauthAccounts),
          avatarUrl: input.image && !existing.avatarUrl ? input.image : existing.avatarUrl,
          firstName: existing.firstName || input.firstName,
          lastName: existing.lastName || input.lastName,
        },
      });
      return userToPublic(user);
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "",
        firstName: input.firstName,
        lastName: input.lastName,
        role: "guest",
        avatarUrl: input.image,
        oauthAccounts: oauthPatch(input.provider, input.providerAccountId),
      },
    });
    return userToPublic(user);
  }

  async promoteToHost(id: string) {
    const user = await prisma.user.update({
      where: { id },
      data: { role: "host" },
    });
    return userToPublic(user);
  }
}
