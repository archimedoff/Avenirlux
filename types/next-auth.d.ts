import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/db/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }
}
