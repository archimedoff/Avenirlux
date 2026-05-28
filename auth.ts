import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { syncOAuthSignIn } from "@/lib/auth/oauth-signin";
import { buildOAuthProviders } from "@/lib/auth/providers";
import { resolveRole } from "@/lib/auth/roles";
import { userRepository } from "@/lib/db/repositories/user-repository";

function parseCredentials(credentials: Record<string, unknown> | undefined) {
  const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
  const password = typeof credentials?.password === "string" ? credentials.password : "";
  if (!email.includes("@") || password.length < 8) return null;
  return { email, password };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;
      const synced = await syncOAuthSignIn({ user, account, profile });
      return Boolean(synced);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as { firstName?: string }).firstName;
        token.lastName = (user as { lastName?: string }).lastName;
        token.role = (user as { role?: import("@/lib/db/types").UserRole }).role;
        return token;
      }
      if (token.id && !token.role) {
        const dbUser = await userRepository.findById(token.id as string);
        if (dbUser) {
          token.role = resolveRole(dbUser.email, dbUser.role ?? "guest");
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.role = (token.role as import("@/lib/db/types").UserRole) ?? "guest";
      }
      return session;
    },
  },
  providers: [
    ...buildOAuthProviders(),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = parseCredentials(credentials);
        if (!parsed) return null;

        const user = await userRepository.findByEmail(parsed.email);
        if (!user) return null;

        if (!userRepository.hasPassword(user)) {
          return null;
        }

        const valid = await userRepository.verifyPassword(user, parsed.password);
        if (!valid) return null;

        const role = resolveRole(user.email, user.role ?? "guest");
        return {
          id: user.id,
          role,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
});
