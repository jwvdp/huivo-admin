import { z } from "@hono/zod-openapi";

export const departmentSchema = z.object({
  createdAt: z.string(),
  defaultRoleId: z.string().nullable(),
  fullPath: z.string(),
  headUserId: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  order: z.number(),
  parentId: z.string().nullable(),
  slug: z.string(),
  updatedAt: z.string()
});

export const createDepartmentSchema = z.object({
  defaultRoleId: z.string().nullable().optional(),
  name: z.string().min(1).max(100),
  order: z.number().int().optional(),
  parentId: z.string().nullable().optional()
});

export const updateDepartmentSchema = z.object({
  defaultRoleId: z.string().nullable().optional(),
  headUserId: z.string().nullable().optional(),
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().optional(),
  parentId: z.string().nullable().optional()
});
