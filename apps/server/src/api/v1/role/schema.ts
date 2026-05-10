import { z } from "@hono/zod-openapi";

export const roleSchema = z.object({
  createdAt: z.number(),
  dataScope: z.enum(["all", "department", "department_and_sub", "self"]),
  description: z.string(),
  fieldPermissions: z.array(
    z.object({ field: z.string(), resource: z.string(), visible: z.boolean() })
  ),
  id: z.string(),
  isBuiltIn: z.boolean(),
  name: z.string(),
  permissions: z.array(z.object({ action: z.string(), resource: z.string() })),
  updatedAt: z.number()
});

export const createRoleSchema = z.object({
  dataScope: z
    .enum(["all", "department", "department_and_sub", "self"])
    .optional(),
  description: z.string().optional(),
  fieldPermissions: z
    .array(
      z.object({
        field: z.string(),
        resource: z.string(),
        visible: z.boolean()
      })
    )
    .optional(),
  name: z.string().min(1).max(100),
  permissions: z
    .array(z.object({ action: z.string(), resource: z.string() }))
    .optional()
});

export const updateRoleSchema = z.object({
  dataScope: z
    .enum(["all", "department", "department_and_sub", "self"])
    .optional(),
  description: z.string().optional(),
  fieldPermissions: z
    .array(
      z.object({
        field: z.string(),
        resource: z.string(),
        visible: z.boolean()
      })
    )
    .optional(),
  name: z.string().min(1).max(100).optional(),
  permissions: z
    .array(z.object({ action: z.string(), resource: z.string() }))
    .optional()
});
