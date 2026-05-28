import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { readJson, writeJson } from "@/lib/db/file-store";
import type { ConciergePreferences, PublicUser, UserProfile, UserRecord, UserRole } from "@/lib/db/types";

const FILE = "users.json";

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
}

function toPublic(user: UserRecord): PublicUser {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

const defaultConcierge = (): ConciergePreferences => ({
  contactChannel: "email",
  preferredLanguage: "English",
});

export class FileUserRepository implements UserRepository {
  private async all(): Promise<UserRecord[]> {
    return readJson<UserRecord[]>(FILE, []);
  }

  private async save(users: UserRecord[]) {
    await writeJson(FILE, users);
  }

  async findByEmail(email: string) {
    const users = await this.all();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return { ...user, role: user.role ?? "guest" };
  }

  async findById(id: string) {
    const users = await this.all();
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    return { ...user, role: user.role ?? "guest" };
  }

  async create(input: { email: string; password: string; firstName: string; lastName: string; role?: UserRole }) {
    const users = await this.all();
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("EMAIL_EXISTS");
    }
    const user: UserRecord = {
      id: randomUUID(),
      role: input.role ?? "guest",
      email: input.email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(input.password, 12),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      createdAt: new Date().toISOString(),
      profile: {},
      conciergePreferences: defaultConcierge(),
    };
    users.push(user);
    await this.save(users);
    return toPublic(user);
  }

  async updateProfile(id: string, profile: Partial<UserProfile>) {
    const users = await this.all();
    const idx = users.findIndex((u) => u.id === id);
    if (idx < 0) return null;
    users[idx] = { ...users[idx], profile: { ...users[idx].profile, ...profile } };
    await this.save(users);
    return toPublic(users[idx]);
  }

  async updateConcierge(id: string, prefs: Partial<ConciergePreferences>) {
    const users = await this.all();
    const idx = users.findIndex((u) => u.id === id);
    if (idx < 0) return null;
    users[idx] = {
      ...users[idx],
      conciergePreferences: { ...users[idx].conciergePreferences, ...prefs },
    };
    await this.save(users);
    return toPublic(users[idx]);
  }

  async verifyPassword(user: UserRecord, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  }
}

export const userRepository: UserRepository = new FileUserRepository();
