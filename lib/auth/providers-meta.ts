import { isGoogleOAuthConfigured } from "@/lib/auth/google-env";
import type { SocialProviderId, SocialProviderState } from "@/lib/auth/social-types";
import { SOCIAL_PROVIDER_META, SOCIAL_PROVIDER_ORDER } from "@/lib/auth/social-types";

function isProviderConfigured(id: SocialProviderId): boolean {
  switch (id) {
    case "google":
      return isGoogleOAuthConfigured();
    case "apple":
      return Boolean(
        (process.env.AUTH_APPLE_ID?.trim() || process.env.APPLE_ID?.trim()) &&
          (process.env.AUTH_APPLE_SECRET?.trim() || process.env.APPLE_SECRET?.trim()),
      );
    case "facebook":
      return Boolean(
        (process.env.AUTH_FACEBOOK_ID?.trim() || process.env.FACEBOOK_CLIENT_ID?.trim()) &&
          (process.env.AUTH_FACEBOOK_SECRET?.trim() || process.env.FACEBOOK_CLIENT_SECRET?.trim()),
      );
    case "twitter":
      return Boolean(
        (process.env.AUTH_TWITTER_ID?.trim() || process.env.TWITTER_CLIENT_ID?.trim()) &&
          (process.env.AUTH_TWITTER_SECRET?.trim() || process.env.TWITTER_CLIENT_SECRET?.trim()),
      );
    default:
      return false;
  }
}

/** Full catalog — always four providers; `enabled` reflects env configuration. */
export function getSocialProviderCatalog(): SocialProviderState[] {
  return SOCIAL_PROVIDER_ORDER.map((id) => ({
    ...SOCIAL_PROVIDER_META[id],
    enabled: isProviderConfigured(id),
  }));
}

/** @deprecated Use getSocialProviderCatalog and filter by enabled. */
export function getEnabledSocialProviders() {
  return getSocialProviderCatalog().filter((p) => p.enabled);
}

export function hasSocialProviders(): boolean {
  return getSocialProviderCatalog().some((p) => p.enabled);
}
