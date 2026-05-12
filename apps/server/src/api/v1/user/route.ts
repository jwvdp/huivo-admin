import { createRoute, z } from "@hono/zod-openapi";
import { updateUserRolesSchema, userWithRoleSchema } from "@huivo-admin/types";

import { errorResponse, jsonBody, jsonResponse } from "../../common";

export const listUserRoute = createRoute({
  description: "获取所有用户及其角色信息",
  method: "get",
  path: "/",
  responses: {
    200: jsonResponse(z.array(userWithRoleSchema))
  },
  summary: "用户列表",
  tags: ["user"]
});

export const updateUserRolesRoute = createRoute({
  description: "批量设置用户角色（替换所有现有角色）",
  method: "patch",
  path: "/:userId/roles",
  request: {
    body: jsonBody(updateUserRolesSchema),
    params: z.object({ userId: z.string() })
  },
  responses: {
    200: jsonResponse(
      z.object({ roleIds: z.array(z.string()), userId: z.string() })
    ),
    404: errorResponse("User not found")
  },
  summary: "设置角色",
  tags: ["user"]
});

export type ListUserRoute = typeof listUserRoute;
export type UpdateUserRolesRoute = typeof updateUserRolesRoute;
