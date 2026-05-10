import { drizzle } from "drizzle-orm/d1";

import { account, session, user, verification } from "../db/schemas/auth";

export const db = (env: Env) => {
  if (env.huivo_admin_database === undefined) {
    throw new Error("huivo_admin_database is not set");
  }

  return drizzle(env.huivo_admin_database, {
    schema: { account, session, user, verification }
  });
};
