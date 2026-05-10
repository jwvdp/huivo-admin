/// <reference types="../worker-configuration.d.ts" />

import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "./api/common";

import { configApp } from "./api/v1/config";
import { departmentApp } from "./api/v1/department";
import { roleApp } from "./api/v1/role";
import { userApp } from "./api/v1/user";
import { withAuth } from "./lib/auth";
import { withScalar } from "./lib/scalar";

export const app = new OpenAPIHono<AppBindings>();

withAuth(app);
withScalar(app);

const routes = app
  .route("/api/v1/config/permissions", configApp)
  .route("/api/v1/department", departmentApp)
  .route("/api/v1/role", roleApp)
  .route("/api/v1/user", userApp);

export type AppType = typeof routes;

export default {
  fetch: app.fetch,
  port: 3100
};
