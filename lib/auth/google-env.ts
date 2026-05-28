/** Strip optional quotes from .env values (common copy-paste mistake). */
function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Google OAuth credentials — supports AUTH_* or GOOGLE_* env names (Vercel-friendly). */
export function getGoogleOAuthCredentials(): { clientId?: string; clientSecret?: string } {
  const clientId = cleanEnv(process.env.AUTH_GOOGLE_ID) || cleanEnv(process.env.GOOGLE_CLIENT_ID);
  const clientSecret =
    cleanEnv(process.env.AUTH_GOOGLE_SECRET) ||
    cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
  return { clientId, clientSecret };
}

export function isGoogleOAuthConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleOAuthCredentials();
  return Boolean(clientId && clientSecret);
}
