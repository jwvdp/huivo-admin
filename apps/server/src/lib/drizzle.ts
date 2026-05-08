import { drizzle } from "drizzle-orm/d1";

import { account, session, user, verification } from "../db/schemas/auth";
import { post } from "../db/schemas/post";

export const db = (env: Env) => {
  if (env.template_database === undefined) {
    throw new Error("template_database is not set");
  }

  return drizzle(env.template_database, {
    schema: { account, post, session, user, verification }
  });
};
