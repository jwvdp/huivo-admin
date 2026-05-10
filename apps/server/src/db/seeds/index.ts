import type { Auth } from "better-auth";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { ac, admin, member, owner } from "../../lib/auth-permissions";
import { schemas } from "../schemas";
import { seedDepartment } from "./department";
import { seedOrganization } from "./organization";
import { seedRole } from "./role";
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
  },
  plugins: [
    organization({
      ac,
      allowUserToCreateOrganization: true,
      roles: { admin, member, owner }
    })
  ]
});

try {
  await seedDepartment(seedDb);
  await seedRole(seedDb);

  // user + org seeds can fail on re-seed (user already exists), handle gracefully
  try {
    await seedUser(seedAuth as unknown as Auth);
  } catch (error) {
    console.log(
      "User seed skipped (may already exist):",
      (error as Error).message
    );
  }

  try {
    await seedOrganization(seedDb);
  } catch (error) {
    console.log("Organization seed skipped:", (error as Error).message);
  }

  console.log("Database seeded successfully.");
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
