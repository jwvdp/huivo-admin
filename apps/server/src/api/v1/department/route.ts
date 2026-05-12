import { createRoute, z } from "@hono/zod-openapi";
import {
  createDepartmentSchema,
  departmentSchema,
  updateDepartmentSchema
} from "@huivo-admin/types";

import { errorResponse, jsonBody, jsonResponse } from "../../common";

export const listDepartmentRoute = createRoute({
  description: "获取所有部门，按 order 排序",
  method: "get",
  path: "/",
  responses: {
    200: jsonResponse(z.array(departmentSchema))
  },
  summary: "部门列表",
  tags: ["department"]
});

export const treeDepartmentRoute = createRoute({
  description: "获取部门树形结构",
  method: "get",
  path: "/tree",
  responses: {
    200: jsonResponse(z.array(z.any()))
  },
  summary: "部门树",
  tags: ["department"]
});

export const createDepartmentRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: jsonBody(createDepartmentSchema)
  },
  responses: {
    200: jsonResponse(departmentSchema)
  },
  summary: "创建部门",
  tags: ["department"]
});

export const getDepartmentRoute = createRoute({
  method: "get",
  path: "/:departmentId",
  request: {
    params: z.object({ departmentId: z.string() })
  },
  responses: {
    200: jsonResponse(departmentSchema),
    404: errorResponse("Department not found")
  },
  summary: "获取部门",
  tags: ["department"]
});

export const updateDepartmentRoute = createRoute({
  method: "patch",
  path: "/:departmentId",
  request: {
    body: jsonBody(updateDepartmentSchema),
    params: z.object({ departmentId: z.string() })
  },
  responses: {
    200: jsonResponse(departmentSchema),
    404: errorResponse("Department not found")
  },
  summary: "更新部门",
  tags: ["department"]
});

export const deleteDepartmentRoute = createRoute({
  description: "有子部门时返回 400",
  method: "delete",
  path: "/:departmentId",
  request: {
    params: z.object({ departmentId: z.string() })
  },
  responses: {
    200: jsonResponse(z.object({ id: z.string() })),
    400: errorResponse("Has child departments"),
    404: errorResponse("Department not found")
  },
  summary: "删除部门",
  tags: ["department"]
});

export type ListDepartmentRoute = typeof listDepartmentRoute;
export type TreeDepartmentRoute = typeof treeDepartmentRoute;
export type CreateDepartmentRoute = typeof createDepartmentRoute;
export type GetDepartmentRoute = typeof getDepartmentRoute;
export type UpdateDepartmentRoute = typeof updateDepartmentRoute;
export type DeleteDepartmentRoute = typeof deleteDepartmentRoute;
