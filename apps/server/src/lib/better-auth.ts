import type { OpenAPIHono } from "@hono/zod-openapi";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AppBindings } from "../api/common";

import { db } from "./drizzle";

export const getAuth = (env: Env) => {
  if (env.huivo_admin_database === undefined) {
    throw new Error("huivo_admin_database is not set");
  }

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db(env), {
      provider: "sqlite"
    }),
    emailAndPassword: {
      enabled: true
    }
  });
};

export const withAuth = (app: OpenAPIHono<AppBindings>) => {
  app.on(["GET", "POST"], "/api/v1/auth/*", (c) => {
    const auth = getAuth(c.env);
    return auth.handler(c.req.raw);
  });
};
