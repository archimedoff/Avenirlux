import type {
  ConciergePreferences,
  OAuthProviderId,
  PublicUser,
  UserProfile,
  UserRecord,
  UserRole,
} from "@/lib/db/types";
import { PrismaUserRepository } from "@/lib/db/repositories/prisma/user-repository";

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<PublicUser>;
  updateProfile(id: string, profile: Partial<UserProfile>): Promise<PublicUser | null>;
  updateConcierge(id: string, prefs: Partial<ConciergePreferences>): Promise<PublicUser | null>;
  verifyPassword(user: UserRecord, password: string): Promise<boolean>;
  upsertOAuthUser(input: {
    email: string;
    firstName: string;
    lastName: string;
    provider: OAuthProviderId;
    providerAccountId: string;
    image?: string;
  }): Promise<PublicUser>;
  hasPassword(user: UserRecord): boolean;
  promoteToHost(id: string): Promise<PublicUser | null>;
}

export const userRepository: UserRepository = new PrismaUserRepository();
