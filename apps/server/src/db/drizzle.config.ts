// oxlint-disable typescript/no-non-null-assertion
import "dotenv/config";
import type { Config } from "drizzle-kit";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_TOKEN!
  },
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/db/schemas"
}) satisfies Config;
