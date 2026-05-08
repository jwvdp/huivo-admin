---
name: server-module
description: "Server API module structure, DB schema, seeding, and common patterns"
trigger: "when creating or modifying server API modules in apps/server/"
---

## Architecture

新模块的开发始终遵循 **Database → Backend → Frontend** 的顺序：

1. **DB schema** (`apps/server/src/db/schemas/`) — Drizzle ORM 表定义。同时创建 `apps/server/src/db/seed/<module>.ts` 写入测试种子数据。
2. **API schema** (`apps/server/src/api/v1/<module>/schema.ts`) — Zod 请求/响应 schema
3. **API route** (`apps/server/src/api/v1/<module>/route.ts`) — Hono OpenAPI 路由定义
4. **API handler** (`apps/server/src/api/v1/<module>/handler.ts`) — 路由处理逻辑
5. **API index** (`apps/server/src/api/v1/<module>/index.ts`) — 注册路由到 app
6. **Frontend** (`apps/web/src/routes/`) — 页面组件和 RPC 调用

## DB Schema

位置: `apps/server/src/db/schemas/`. 使用 `drizzle-orm/sqlite-core`.

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const post = sqliteTable("post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
  title: text("title").notNull().default("")
});
```

## Seeding

每个模块必须提供种子脚本，用于本地开发和测试。

位置: `apps/server/src/db/seed/`, 每个模块对应一个文件。

```ts
// src/db/seed/post.ts
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { post } from "../schemas/post";

export async function seedPost(db: LibSQLDatabase<any>) {
  await db.delete(post);
  await db
    .insert(post)
    .values([
      { title: "Getting Started", content: "...", status: "published" }
    ]);
}
```

种子通过 `drizzle-orm/libsql` + `@libsql/client` 直接连接本地 D1 的 SQLite 文件。

入口 `seed/index.ts` 自动发现本地 D1 数据库路径，按顺序执行所有 seeder。

```bash
# 重置本地数据库（清空 → 推 schema → 写入种子数据）
bun db:reset

# 分开执行
bun db:clean      # 清空所有表
bun push          # 推 schema
bun db:seed       # 写入种子数据
```

清理原理: `drizzle.clean.config.ts` 指向一个空的 schema 目录（`src/db/.empty-schema/`），`push --force` 时 Drizzle 检测到当前数据库有表而 schema 没有，生成 DROP 语句清空所有表。

## API Module Structure

每个模块在 `apps/server/src/api/v1/<module>/` 下包含 4 个文件：

### `schema.ts` — Zod schemas

```ts
import { z } from "@hono/zod-openapi";

export const postSchema = z.object({
  id: z.string(),
  title: z.string()
  // ...
});

export const createPostSchema = z.object({
  title: z.string().min(1).max(200)
});
```

### `route.ts` — OpenAPI 路由定义

```ts
import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse, jsonBody, jsonResponse } from "../../common";
import { postSchema } from "./schema";

export const listPostRoute = createRoute({
  method: "get",
  path: "/",
  responses: { 200: jsonResponse(z.array(postSchema)) },
  tags: ["post"]
});

export type ListPostRoute = typeof listPostRoute;
```

### `handler.ts` — 处理函数

```ts
import type { AppRouteHandler } from "../../common";
import type { ListPostRoute } from "./route";
import { post } from "../../../db/schemas/post";
import { db } from "../../../lib/drizzle";

export const listPostHandler: AppRouteHandler<ListPostRoute> = async (c) => {
  const posts = await db(c.env).select().from(post);
  return c.json(posts, 200);
};
```

### `index.ts` — 注册路由

```ts
import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "../../common";
import { requireAuth } from "../../../lib/require-auth";
import { handlers } from "./handler";
import { routes } from "./route";

const app = new OpenAPIHono<AppBindings>().use("*", requireAuth);
export const moduleApp = app.openapi(routes.list, handlers.list);
```

### 注册到主应用

在 `apps/server/src/index.ts` 中挂载:

```ts
const routes = app.route("/api/v1/post", postApp);
export type AppType = typeof routes;
```

## 工具函数

- `jsonBody(schema)` / `jsonResponse(schema)` — 包装 Zod schema 为 OpenAPI 响应格式
- `errorResponse(desc)` — 返回 `{ message: string }` 的错误响应
- `requireAuth` — 中间件，验证 Better Auth session，设置 `c.get("userId")`
- `db(c.env)` — 获取 D1 数据库实例

## Common Patterns

- Handler 签名: `AppRouteHandler<RouteType>` — 提供类型安全的 `c.req.valid()`
- 参数校验: `c.req.valid("param")`, `c.req.valid("json")`
- 404 处理: 查询结果为空时返回 `c.json({ message: "..." }, 404)`
- 资源不存在时 mutation 也返回 404，让前端统一处理
