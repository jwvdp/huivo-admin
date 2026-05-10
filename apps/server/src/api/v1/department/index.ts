import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../../common";

import { requireAuth } from "../../../lib/auth";
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getDepartmentHandler,
  listDepartmentHandler,
  treeDepartmentHandler,
  updateDepartmentHandler
} from "./handler";
import {
  createDepartmentRoute,
  deleteDepartmentRoute,
  getDepartmentRoute,
  listDepartmentRoute,
  treeDepartmentRoute,
  updateDepartmentRoute
} from "./route";

const app = new OpenAPIHono<AppBindings>().use(
  "*",
  requireAuth
) as OpenAPIHono<AppBindings>;

export const departmentApp = app
  .openapi(listDepartmentRoute, listDepartmentHandler)
  .openapi(treeDepartmentRoute, treeDepartmentHandler)
  .openapi(createDepartmentRoute, createDepartmentHandler)
  .openapi(getDepartmentRoute, getDepartmentHandler)
  .openapi(updateDepartmentRoute, updateDepartmentHandler)
  .openapi(deleteDepartmentRoute, deleteDepartmentHandler);
