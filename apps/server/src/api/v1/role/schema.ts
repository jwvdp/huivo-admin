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

export type Role = z.infer<typeof roleSchema>;

export const createRoleSchema = roleSchema
  .pick({
    dataScope: true,
    description: true,
    fieldPermissions: true,
    name: true,
    permissions: true
  })
  .partial()
  .extend({ name: z.string().min(1).max(100) });

export const updateRoleSchema = createRoleSchema.partial();
