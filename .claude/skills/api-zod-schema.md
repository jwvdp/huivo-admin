---
name: api-zod-schema
description: Use when creating or modifying API endpoint files in apps/server/src/api/ — route definitions, handlers, and module entry points
---

# API Endpoint Conventions

## Overview

Each API module uses a 3-layer structure under `api/v1/<domain>/`. Schemas are imported from `@huivo-admin/types` — see **shared-types-package** skill for schema definitions.

## Module Structure

```
api/v1/<domain>/
  route.ts    — OpenAPI route definitions
  handler.ts  — request handlers
  index.ts    — module entry, mounts routes
```

Root `src/index.ts` mounts sub-modules:

```ts
app.route("/api/v1/role", roleApp);
```

Sub-module routes use **relative paths** (`"/"` → `/api/v1/role` at runtime).

## Route Definition (route.ts)

```ts
import { createRoute, z } from "@hono/zod-openapi";
import {
  createRoleSchema,
  roleSchema,
  updateRoleSchema
} from "@huivo-admin/types";
import { errorResponse, jsonBody, jsonResponse } from "../../common";

export const listRoleRoute = createRoute({
  method: "get",
  path: "/",
  responses: { 200: jsonResponse(z.array(roleSchema)) },
  summary: "角色列表",
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
```

### Conventions

- **Methods**: `get` / `post` / `patch` / `delete` (lowercase)
- **Path params**: declared inline — `z.object({ roleId: z.string() })`, not extracted to types package
- **Responses**: success → `jsonResponse(schema)`, error → `errorResponse("description")`
- **Tags**: match the module name
- Export route type: `export type XxxRoute = typeof xxxRoute`
- Sub-routes (e.g., `/:userId/roles`) live under the parent module

## Handler (handler.ts)

Use `AppRouteHandler<TRoute>`. Extract validated data with `c.req.valid()`:

```ts
import type { AppRouteHandler } from "../../common";
import type { ListRoleRoute, CreateRoleRoute } from "./route";
import { role as roleTable } from "../../../db/schemas/role";
import { db } from "../../../lib/drizzle";

export const listRoleHandler: AppRouteHandler<ListRoleRoute> = async (c) => {
  const roles = await db(c.env)
    .select()
    .from(roleTable)
    .orderBy(roleTable.createdAt);
  return c.json(roles, 200);
};

export const createRoleHandler: AppRouteHandler<CreateRoleRoute> = async (
  c
) => {
  const body = c.req.valid("json");
  // ...
  return c.json(created, 200);
};
```

### Data Extraction

| Source       | Method                 |
| ------------ | ---------------------- |
| JSON body    | `c.req.valid("json")`  |
| Path params  | `c.req.valid("param")` |
| Query params | `c.req.valid("query")` |

Always use `c.req.valid()` — never `c.req.json()` or `c.req.param()` (those skip validation).

### Error Handling

```ts
// 404 — existence check
const existing = await db(c.env)
  .select({ id: roleTable.id })
  .from(roleTable)
  .where(eq(roleTable.id, roleId))
  .limit(1)
  .then((r) => r[0]);
if (!existing) return c.json({ message: "Role not found" }, 404);

// 400 — business constraint
if (existing.isBuiltIn)
  return c.json({ message: "Built-in role cannot be deleted" }, 400);
```

### Conventions

- Database queries use `db(c.env)` (dependency injection)
- Status codes: success → 200, client error → 400, not found → 404
- `c.json(body, status)` — second arg is the status code

## Module Entry (index.ts)

```ts
import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "../../common";
import { requireAuth } from "../../../lib/auth";
import { listRoleHandler, createRoleHandler } from "./handler";
import { listRoleRoute, createRoleRoute } from "./route";

const app = new OpenAPIHono<AppBindings>().use(
  "*",
  requireAuth
) as OpenAPIHono<AppBindings>;

export const roleApp = app
  .openapi(listRoleRoute, listRoleHandler)
  .openapi(createRoleRoute, createRoleHandler);
```

### Conventions

- `requireAuth` applied globally via `.use("*", requireAuth)`
- `as OpenAPIHono<AppBindings>` type assertion needed — `.use()` narrows return type
- Export named `<domain>App` (e.g., `roleApp`, `departmentApp`)
- Route registration order: get → post → patch → delete

## Common Utilities (api/common.ts)

Shared helpers at `src/api/common.ts`:

```ts
export function jsonBody<T extends z.ZodType>(schema: T) { ... }
export function jsonResponse<T extends z.ZodType>(schema: T, description = "Response successful") { ... }
export function errorResponse(description = "Error response") { ... }

export interface AppBindings {
  Bindings: Env;
  Variables: { userId?: string; roleNames?: string[]; dataScope?: string };
}

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
```

Import from modules as `import { ... } from "../../common"` (relative to `api/v1/<domain>/`).

## Related Skills

- **shared-types-package** — Zod schema definitions consumed by routes and handlers
