import { isGoogleOAuthConfigured } from "@/lib/auth/google-env";
import type { SocialProviderId, SocialProviderMeta } from "@/lib/auth/social-types";
import { SOCIAL_PROVIDER_META } from "@/lib/auth/social-types";

function isConfigured(id: SocialProviderId): boolean {
  switch (id) {
    case "google":
      return isGoogleOAuthConfigured();
    case "apple":
      return Boolean(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET);
    case "facebook":
      return Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET);
    case "twitter":
      return Boolean(process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET);
    default:
      return false;
  }
}

export function getEnabledSocialProviders(): SocialProviderMeta[] {
  const order: SocialProviderId[] = ["google", "apple", "facebook", "twitter"];
  return order.filter(isConfigured).map((id) => SOCIAL_PROVIDER_META[id]);
}

export function hasSocialProviders(): boolean {
  return getEnabledSocialProviders().length > 0;
}
