import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../../common";

import { requireAuth } from "../../../lib/auth";
import { listUserHandler, updateUserRolesHandler } from "./handler";
import { listUserRoute, updateUserRolesRoute } from "./route";

const app = new OpenAPIHono<AppBindings>().use(
  "*",
  requireAuth
) as OpenAPIHono<AppBindings>;

export const userApp = app
  .openapi(listUserRoute, listUserHandler)
  .openapi(updateUserRolesRoute, updateUserRolesHandler);
