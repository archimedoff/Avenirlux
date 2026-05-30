import { config } from "dotenv";

import { composeDatabaseUrls } from "../lib/db/compose-database-urls";

config({ path: ".env.local" });

const urls = composeDatabaseUrls();
console.log("DATABASE_URL ok (pooler :6543, pgbouncer=true)");
console.log("DIRECT_URL ok (port :5432)");
console.log(urls.databaseUrl.replace(/:[^:@/]+@/, ":***@"));
console.log(urls.directUrl.replace(/:[^:@/]+@/, ":***@"));
