import { z } from "@hono/zod-openapi";

export const userWithRoleSchema = z.object({
  createdAt: z.number(),
  email: z.string(),
  id: z.string(),
  image: z.string().nullable(),
  name: z.string(),
  roles: z.array(z.object({ roleId: z.string(), roleName: z.string() })),
  updatedAt: z.number()
});

export type UserWithRole = z.infer<typeof userWithRoleSchema>;

export const updateUserRolesSchema = z.object({
  roleIds: z.array(z.string())
});
