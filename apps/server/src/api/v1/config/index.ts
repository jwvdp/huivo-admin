import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../../common";

import { requireAuth } from "../../../lib/auth";
import { getPermissionsConfigHandler } from "./handler";
import { getPermissionsConfigRoute } from "./route";

const app = new OpenAPIHono<AppBindings>().use(
  "*",
  requireAuth
) as OpenAPIHono<AppBindings>;

export const configApp = app.openapi(
  getPermissionsConfigRoute,
  getPermissionsConfigHandler
);
