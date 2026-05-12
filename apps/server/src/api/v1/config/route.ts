import { createRoute } from "@hono/zod-openapi";
import { permissionsConfigSchema } from "@huivo-admin/types";

import { jsonResponse } from "../../common";

export const getPermissionsConfigRoute = createRoute({
  description: "获取系统权限配置元数据（资源、动作、字段掩码选项等）",
  method: "get",
  path: "/",
  responses: {
    200: jsonResponse(permissionsConfigSchema)
  },
  summary: "权限配置元数据",
  tags: ["config"]
});

export type GetPermissionsConfigRoute = typeof getPermissionsConfigRoute;
