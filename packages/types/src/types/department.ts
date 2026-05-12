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

export type Department = z.infer<typeof departmentSchema>;

export const createDepartmentSchema = departmentSchema
  .pick({ defaultRoleId: true, name: true, order: true, parentId: true })
  .partial()
  .extend({
    name: z.string().min(1).max(100),
    order: z.number().int().optional()
  });

export const updateDepartmentSchema = departmentSchema
  .pick({
    defaultRoleId: true,
    headUserId: true,
    name: true,
    order: true,
    parentId: true
  })
  .partial()
  .extend({
    name: z.string().min(1).max(100).optional(),
    order: z.number().int().optional()
  });

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}
