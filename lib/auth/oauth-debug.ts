import { getGoogleOAuthCredentials, isGoogleOAuthConfigured } from "@/lib/auth/google-env";

export function logOAuthDebug(context: string): void {
  if (process.env.NODE_ENV !== "development") return;

  const google = getGoogleOAuthCredentials();
  console.info(`[AvenirLux OAuth] ${context}`, {
    googleConfigured: isGoogleOAuthConfigured(),
    clientIdLength: google.clientId?.length ?? 0,
    clientSecretLength: google.clientSecret?.length ?? 0,
    envPresent: {
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
      AUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID?.trim()),
      AUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET?.trim()),
    },
  });

  if (!isGoogleOAuthConfigured()) {
    console.warn(
      "[AvenirLux OAuth] Google disabled — set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local and restart npm run dev",
    );
  }
}

export function getOAuthDebugPayload() {
  if (process.env.NODE_ENV !== "development") return undefined;
  const google = getGoogleOAuthCredentials();
  return {
    googleConfigured: isGoogleOAuthConfigured(),
    clientIdLength: google.clientId?.length ?? 0,
    clientSecretLength: google.clientSecret?.length ?? 0,
    envPresent: {
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
      AUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID?.trim()),
      AUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET?.trim()),
    },
  };
}
