---
name: shared-types-package
description: Use when creating or modifying Zod schemas in packages/types/src/ for shared backend-frontend type definitions
---

# Shared Types Package

## Overview

All Zod schemas live in `@huivo-admin/types` (`packages/types/src/`), shared between backend and frontend. No `schema.ts` files inside API modules.

## File Structure

```
packages/types/src/
  index.ts           — unified exports
  types/
    role.ts
    department.ts
    user.ts
    config.ts
```

## Schema Derivation Pattern

Start with a **base schema** for the full entity, then derive create/update variants via `.pick()` → `.partial()` → `.extend()`:

```ts
import { z } from "@hono/zod-openapi";

// base — complete entity
export const roleSchema = z.object({
  createdAt: z.number(),
  dataScope: z.enum(["all", "department", "department_and_sub", "self"]),
  description: z.string(),
  id: z.string(),
  isBuiltIn: z.boolean(),
  name: z.string(),
  permissions: z.array(z.object({ action: z.string(), resource: z.string() })),
  fieldPermissions: z.array(
    z.object({ field: z.string(), resource: z.string(), visible: z.boolean() })
  ),
  updatedAt: z.number()
});

export type Role = z.infer<typeof roleSchema>;

// create — pick fields → partial → extend with validations
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

// update — createSchema fully partial, reuses all validations
export const updateRoleSchema = createRoleSchema.partial();
```

## When create/update Fields Differ

Use separate `.pick()` for each:

```ts
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
```

## Export Convention

`packages/types/src/index.ts` re-exports everything:

```ts
export {
  createRoleSchema,
  roleSchema,
  type Role,
  updateRoleSchema
} from "./types/role";
```

## Quick Reference

| Operation    | Pattern                                           |
| ------------ | ------------------------------------------------- |
| Base entity  | `z.object({...})` with all fields                 |
| Create input | `base.pick(fields).partial().extend(validations)` |
| Update input | `createSchema.partial()`                          |
| Type export  | `export type Foo = z.infer<typeof fooSchema>`     |
| Enum field   | `z.enum([...])`                                   |

## Related Skills

- **api-zod-schema** — how schemas are consumed in API route/handler/index layers
- **frontend-ui-patterns** — how types are imported and used in React components
