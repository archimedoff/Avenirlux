export type SocialProviderId = "google" | "apple" | "facebook" | "twitter";

export type SocialProviderMeta = {
  id: SocialProviderId;
  label: string;
  signInLabel: string;
};

export type SocialProviderState = SocialProviderMeta & {
  enabled: boolean;
};

export const SOCIAL_PROVIDER_ORDER: SocialProviderId[] = ["google", "apple", "twitter", "facebook"];

export const SOCIAL_PROVIDER_META: Record<SocialProviderId, SocialProviderMeta> = {
  google: { id: "google", label: "Google", signInLabel: "Continue with Google" },
  apple: { id: "apple", label: "Apple", signInLabel: "Continue with Apple" },
  facebook: { id: "facebook", label: "Facebook", signInLabel: "Continue with Facebook" },
  twitter: { id: "twitter", label: "X", signInLabel: "Continue with X" },
};
