import { drizzle } from "drizzle-orm/d1";

import { schemas } from "../db/schemas";

export const db = (env: Env) => {
  if (env.huivo_admin_database === undefined) {
    throw new Error("huivo_admin_database is not set");
  }

  return drizzle(env.huivo_admin_database, {
    schema: schemas
  });
};
