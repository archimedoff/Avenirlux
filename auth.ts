import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { userRepository } from "@/lib/db/repositories/user-repository";

function parseCredentials(credentials: Record<string, unknown> | undefined) {
  const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
  const password = typeof credentials?.password === "string" ? credentials.password : "";
  if (!email.includes("@") || password.length < 8) return null;
  return { email, password };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
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

        const valid = await userRepository.verifyPassword(user, parsed.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
});
