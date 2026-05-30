/**
 * Writes DATABASE_URL + DIRECT_URL to .env.local from SUPABASE_DB_PASSWORD
 * (URL-encodes special characters). Run: npm run db:sync-env
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { config } from "dotenv";

import { composeDatabaseUrls } from "../lib/db/compose-database-urls";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function stripDbLines(content: string): string {
  const drop = new Set([
    "DATABASE_URL",
    "DIRECT_URL",
    "SUPABASE_PROJECT_REF",
    "SUPABASE_POOLER_HOST",
    "SUPABASE_DB_HOST",
    "SUPABASE_DB_PASSWORD",
  ]);
  const lines = content.split("\n");
  const out: string[] = [];
  let skippingComment = false;
  for (const line of lines) {
    if (/^#\s*Supabase Postgres/i.test(line)) {
      skippingComment = true;
      continue;
    }
    if (skippingComment) {
      if (line.startsWith("#") || line.trim() === "") continue;
      if (/^[A-Z_]+=/.test(line)) {
        const key = line.split("=")[0];
        if (drop.has(key)) continue;
      }
      skippingComment = false;
    }
    const key = line.split("=")[0];
    if (drop.has(key)) continue;
    if (/^#\s*Connect to Postgres via the shared/i.test(line)) continue;
    if (/^#\s*Optional: db\./i.test(line)) continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

function main() {
  config({ path: ENV_PATH });
  const password = process.env.SUPABASE_DB_PASSWORD?.trim() || process.argv[2]?.trim();
  if (password) process.env.SUPABASE_DB_PASSWORD = password;

  const urls = composeDatabaseUrls();
  const ref = process.env.SUPABASE_PROJECT_REF?.trim() ?? "zyicujmtdmbthqkvniyh";
  const host = process.env.SUPABASE_POOLER_HOST?.trim() ?? "aws-1-eu-central-1.pooler.supabase.com";

  const block = `
# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="${urls.databaseUrl}"

# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="${urls.directUrl}"

# Components (password stored for npm run db:sync-env)
SUPABASE_PROJECT_REF=${ref}
SUPABASE_POOLER_HOST=${host}
SUPABASE_DB_PASSWORD=${password ?? process.env.SUPABASE_DB_PASSWORD}
`;

  const existing = readFileSync(ENV_PATH, "utf8");
  writeFileSync(ENV_PATH, stripDbLines(existing) + block + "\n", "utf8");
  console.log("Updated .env.local with DATABASE_URL (:6543) and DIRECT_URL (:5432)");
}

main();
