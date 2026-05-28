import type { Provider } from "next-auth/providers";
import Apple from "next-auth/providers/apple";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";

import type { SocialProviderId } from "@/lib/auth/social-types";

export function buildOAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
    providers.push(
      Apple({
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: process.env.AUTH_APPLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
    providers.push(
      Facebook({
        clientId: process.env.AUTH_FACEBOOK_ID,
        clientSecret: process.env.AUTH_FACEBOOK_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
    providers.push(
      Twitter({
        clientId: process.env.AUTH_TWITTER_ID,
        clientSecret: process.env.AUTH_TWITTER_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  return providers;
}

export function isOAuthProviderId(value: string): value is SocialProviderId {
  return value === "google" || value === "apple" || value === "facebook" || value === "twitter";
}
