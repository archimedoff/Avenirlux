import { spawnSync } from "child_process";

import { config } from "dotenv";

import { applyDatabaseUrlsToEnv } from "../lib/db/compose-database-urls";

config({ path: ".env.local" });

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: tsx scripts/run-with-database-url.ts -- <command> [args...]");
  process.exit(1);
}

let command = args;
if (command[0] === "--") command = command.slice(1);
if (!command.length) {
  console.error("No command provided after --");
  process.exit(1);
}

try {
  applyDatabaseUrlsToEnv();
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}

const result = spawnSync(command[0], command.slice(1), {
  stdio: "inherit",
  env: process.env,
  shell: false,
});
process.exit(result.status ?? 1);
