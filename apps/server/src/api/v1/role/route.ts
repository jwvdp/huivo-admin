import { createRoute, z } from "@hono/zod-openapi";
import {
  createRoleSchema,
  roleSchema,
  updateRoleSchema
} from "@huivo-admin/types";

import { errorResponse, jsonBody, jsonResponse } from "../../common";

export const listRoleRoute = createRoute({
  description: "获取所有角色及其权限、字段掩码配置",
  method: "get",
  path: "/",
  responses: {
    200: jsonResponse(z.array(roleSchema))
  },
  summary: "角色列表",
  tags: ["role"]
});

export const createRoleRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: jsonBody(createRoleSchema)
  },
  responses: {
    200: jsonResponse(roleSchema)
  },
  summary: "创建角色",
  tags: ["role"]
});

export const updateRoleRoute = createRoute({
  method: "patch",
  path: "/:roleId",
  request: {
    body: jsonBody(updateRoleSchema),
    params: z.object({ roleId: z.string() })
  },
  responses: {
    200: jsonResponse(roleSchema),
    404: errorResponse("Role not found")
  },
  summary: "更新角色",
  tags: ["role"]
});

export const deleteRoleRoute = createRoute({
  description: "内置角色（isBuiltIn）不可删除",
  method: "delete",
  path: "/:roleId",
  request: {
    params: z.object({ roleId: z.string() })
  },
  responses: {
    200: jsonResponse(z.object({ id: z.string() })),
    400: errorResponse("Built-in role cannot be deleted"),
    404: errorResponse("Role not found")
  },
  summary: "删除角色",
  tags: ["role"]
});

export type ListRoleRoute = typeof listRoleRoute;
export type CreateRoleRoute = typeof createRoleRoute;
export type UpdateRoleRoute = typeof updateRoleRoute;
export type DeleteRoleRoute = typeof deleteRoleRoute;
