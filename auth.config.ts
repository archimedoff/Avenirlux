import type { NextAuthConfig } from "next-auth";

import { canAccessAdmin, canAccessHost } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/db/types";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const role = (auth?.user as { role?: UserRole } | undefined)?.role ?? "guest";
      if (path.startsWith("/admin")) return !!auth && canAccessAdmin(role);
      if (path.startsWith("/host")) return !!auth && canAccessHost(role);
      if (path.startsWith("/account")) return !!auth;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as { firstName?: string }).firstName;
        token.lastName = (user as { lastName?: string }).lastName;
        token.role = (user as { role?: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.role = (token.role as UserRole) ?? "guest";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
