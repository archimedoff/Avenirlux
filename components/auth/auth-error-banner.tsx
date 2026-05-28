"use client";

const MESSAGES: Record<string, string> = {
  OAuthSignin: "Could not start sign-in. Please try again.",
  OAuthCallback: "Sign-in was interrupted. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try another method.",
  OAuthAccountNotLinked: "This email is linked to another sign-in method. Use the same provider you used before.",
  AccessDenied: "Access was denied. Please allow the requested permissions.",
  Configuration: "Sign-in is not configured yet. Contact support or use email.",
  Default: "Something went wrong while signing in. Please try again.",
};

export function AuthErrorBanner({ error }: { error?: string | null }) {
  if (!error) return null;
  const message = MESSAGES[error] ?? MESSAGES.Default;
  return (
    <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm leading-relaxed text-amber-950" role="alert">
      {message}
    </p>
  );
}
