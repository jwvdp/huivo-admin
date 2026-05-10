import "dotenv/config";
import type { Config } from "drizzle-kit";

import { defineConfig } from "drizzle-kit";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function findLocalD1Url(): string {
  const d1Dir = join(
    process.cwd(),
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject"
  );
  const files = readdirSync(d1Dir);
  const dbFile = files.find(
    (f) => f.endsWith(".sqlite") && !f.startsWith("metadata")
  );
  if (!dbFile) {
    throw new Error("Local D1 database not found. Run 'bun push' first.");
  }
  return join(d1Dir, dbFile);
}

export default defineConfig({
  dbCredentials: {
    url: findLocalD1Url()
  },
  dialect: "sqlite",
  schema: "./src/db/drizzle.clean.config.ts"
}) satisfies Config;
