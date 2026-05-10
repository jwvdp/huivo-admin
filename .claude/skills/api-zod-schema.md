---
name: api-zod-schema
description: "Backend API conventions: Zod schema derivation + endpoint structure (route/handler/index)"
trigger: "when creating or modifying files in apps/server/src/api/v1/"
---

## 模块结构

每个 API 模块四层，放在 `api/v1/<domain>/` 目录下：

```
api/v1/<domain>/
  schema.ts   — Zod schema 定义
  route.ts    — OpenAPI 路由定义
  handler.ts  — 请求处理器
  index.ts    — 模块入口，挂载路由
```

根入口 `src/index.ts` 挂载子模块：

```ts
app.route("/api/v1/role", roleApp);
```

子模块内路由用**相对路径**，运行时会拼接前缀（如 `"/"` → `/api/v1/role`）。

---

## Schema 定义（schema.ts）

### 核心规则

**不要重新定义 create/update schema。** 从 base entity schema 用 `.pick()`, `.partial()`, `.extend()` 推导。

### 基础模式

```ts
// base — 完整实体
export const roleSchema = z.object({
  dataScope: z.enum(["all", "department", "department_and_sub", "self"]),
  description: z.string(),
  fieldPermissions: z.array(
    z.object({ field: z.string(), resource: z.string(), visible: z.boolean() })
  ),
  id: z.string(),
  isBuiltIn: z.boolean(),
  name: z.string(),
  permissions: z.array(z.object({ action: z.string(), resource: z.string() }))
});

// create — pick 需要的字段 → partial() 让非必填 → extend() 覆盖验证规则不同的字段
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

// update — createSchema 全 partial，复用所有验证
export const updateRoleSchema = createRoleSchema.partial();
```

### 处理字段差异

如果 create 和 update 的字段集合不同，各自 `.pick()`：

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

### 需要 `.extend()` 覆盖的场景

只有 base schema 的验证不够用时才覆盖：

| 场景                                               | 做法             |
| -------------------------------------------------- | ---------------- |
| 字段需要更严格的类型约束（如 `name` 要 `.min(1)`） | `.extend()`      |
| 字段需要额外 refine（如 `order` 要 `.int()`）      | `.extend()`      |
| 类型、optional、nullable 完全继承 base             | 不处理，自动继承 |

### 例外

- 响应 schema（如 `userWithRoleSchema`）不需要 create/update 版本，保持原样
- 与 base 字段结构完全不同的 schema（如 `updateUserRolesSchema` 只有 `roleIds`），单独定义

---

## 路由定义（route.ts）

使用 `createRoute()` 定义 OpenAPI 路由，每个路由是一个具名导出常量。

```ts
import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse, jsonBody, jsonResponse } from "../../common";

export const listRoleRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: jsonResponse(z.array(roleSchema))
  },
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
  tags: ["role"]
});
```

### 约定

- **方法**: get / post / patch / delete（全小写）
- **路径参数**: 用 `param` 声明 `z.object({ roleId: z.string() })`
- **响应**: 成功用 `jsonResponse(schema)`，错误用 `errorResponse("描述")`
- **tags**: 和模块名一致
- 所有 `responses` 不要省略 `description` —— `jsonResponse` 有默认值，`errorResponse` 的入参就是 description
- 每个路由导出类型：`export type XxxRoute = typeof xxxRoute`
- path param schema 保持内联，不需要提取到 schema.ts

---

## 请求处理（handler.ts）

handler 用 `AppRouteHandler<TRoute>` 类型，从 `c.req.valid()` 取已验证的数据。

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

### 数据提取

| 来源         | 方法                   |
| ------------ | ---------------------- |
| JSON body    | `c.req.valid("json")`  |
| Path params  | `c.req.valid("param")` |
| Query params | `c.req.valid("query")` |

### 错误处理模式

```ts
// 1. 检查存在（404）
const existing = await db(c.env)
  .select({ id: roleTable.id })
  .from(roleTable)
  .where(eq(roleTable.id, roleId))
  .limit(1)
  .then((r) => r[0]);

if (!existing) {
  return c.json({ message: "Role not found" }, 404);
}

// 2. 检查业务约束（400）
if (existing.isBuiltIn) {
  return c.json({ message: "Built-in role cannot be deleted" }, 400);
}
```

### 约定

- handler 只用 `c.req.valid()` 获取数据，不使用 `c.req.json()` 或 `c.req.param()`（这些跳过验证）
- 数据库查询用 `db(c.env)`，依赖注入方式
- 返回状态码：成功 200，客户端错误 400，未找到 404
- `c.json(body, status)` 第二个参数是 status code

---

## 模块入口（index.ts）

创建 `OpenAPIHono` 实例，挂载 `requireAuth`，链式注册路由。

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

### 约定

- `requireAuth` 全局应用在所有路由上
- `app` 需要 `as OpenAPIHono<AppBindings>` 类型断言（`use` 返回类型收窄问题）
- 导出命名：`<domain>App`（如 `roleApp`, `departmentApp`）
- 路由注册顺序：get → post → patch → delete
