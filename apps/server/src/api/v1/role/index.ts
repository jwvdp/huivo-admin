import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../../common";

import { requireAuth } from "../../../lib/auth";
import {
  createRoleHandler,
  deleteRoleHandler,
  listRoleHandler,
  updateRoleHandler
} from "./handler";
import {
  createRoleRoute,
  deleteRoleRoute,
  listRoleRoute,
  updateRoleRoute
} from "./route";

const app = new OpenAPIHono<AppBindings>().use(
  "*",
  requireAuth
) as OpenAPIHono<AppBindings>;

export const roleApp = app
  .openapi(listRoleRoute, listRoleHandler)
  .openapi(createRoleRoute, createRoleHandler)
  .openapi(updateRoleRoute, updateRoleHandler)
  .openapi(deleteRoleRoute, deleteRoleHandler);
