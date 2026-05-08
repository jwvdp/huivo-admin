import type { Auth } from "better-auth";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { schemas } from "../schemas";
import { seedPost } from "./post";
import { seedUser } from "./user";

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

const client = createClient({ url: `file://${findLocalD1Url()}` });

export const seedDb = drizzle({
  client,
  schema: schemas
  // oxlint-disable-next-line typescript/no-explicit-any
}) as LibSQLDatabase<any>;
export const seedAuth = betterAuth({
  baseURL: "http://localhost:3000/api/v1/auth",
  database: drizzleAdapter(seedDb, {
    provider: "sqlite"
  }),
  emailAndPassword: {
    enabled: true
  }
});

try {
  await seedPost(seedDb);
  await seedUser(seedAuth as Auth);
  console.log("Database seeded successfully.");
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
