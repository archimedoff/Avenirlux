#!/usr/bin/env npx tsx
/**
 * Pre-deploy checklist — prints SET/MISSING without exposing secret values.
 * Usage: dotenv -e .env.local -- npx tsx scripts/verify-production-readiness.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

type Check = { key: string; required: "production" | "recommended" | "optional"; clientSafe?: boolean };

const CHECKS: Check[] = [
  { key: "AUTH_SECRET", required: "production" },
  { key: "AUTH_URL", required: "production" },
  { key: "NEXT_PUBLIC_SITE_URL", required: "production", clientSafe: true },
  { key: "DATABASE_URL", required: "production" },
  { key: "DIRECT_URL", required: "production" },
  { key: "LITEAPI_KEY", required: "recommended" },
  { key: "LITE_API_KEY", required: "optional" },
  { key: "STRIPE_SECRET_KEY", required: "production" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: "production", clientSafe: true },
  { key: "STRIPE_WEBHOOK_SECRET", required: "production" },
  { key: "RESEND_API_KEY", required: "recommended" },
  { key: "EMAIL_FROM", required: "recommended" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: "recommended", clientSafe: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: "recommended" },
  { key: "SUPABASE_STORAGE_BUCKET", required: "optional" },
  { key: "GOOGLE_CLIENT_ID", required: "optional", clientSafe: true },
  { key: "GOOGLE_CLIENT_SECRET", required: "optional" },
  { key: "OPENAI_API_KEY", required: "optional" },
  { key: "ADMIN_EMAILS", required: "optional" },
];

function status(key: string) {
  const v = process.env[key]?.trim();
  return v ? "SET" : "MISSING";
}

let fail = 0;
console.log("\nAvenirLux production readiness\n");
for (const c of CHECKS) {
  const s = status(c.key);
  const liteapiOk = c.key === "LITEAPI_KEY" && s === "MISSING" && status("LITE_API_KEY") === "SET";
  const ok = s === "SET" || liteapiOk;
  const mark = ok ? "✓" : c.required === "production" ? "✗" : "○";
  if (!ok && c.required === "production") fail++;
  console.log(`  ${mark} ${c.key.padEnd(36)} ${liteapiOk ? "SET (via LITE_API_KEY)" : s}  [${c.required}]${c.clientSafe ? " (client-safe)" : ""}`);
}

const leaked = CHECKS.filter((c) => !c.clientSafe && c.key.startsWith("NEXT_PUBLIC_"));
if (leaked.length) {
  console.log("\nFAIL: server secrets exposed via NEXT_PUBLIC_*");
  fail++;
}

console.log(fail ? "\nBLOCKED: fix production-required vars before deploy.\n" : "\nOK: production-required vars present locally.\n");
process.exit(fail ? 1 : 0);
