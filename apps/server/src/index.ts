/// <reference types="../worker-configuration.d.ts" />

import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "./api/common";

import { withAuth } from "./lib/better-auth";
import { withScalar } from "./lib/scalar";

export const app = new OpenAPIHono<AppBindings>();

withAuth(app);
withScalar(app);

const routes = app;

export type AppType = typeof routes;

export default {
  fetch: app.fetch,
  port: 3100
};
