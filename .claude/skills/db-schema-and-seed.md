---
name: db-schema-and-seed
description: "DB schema definition patterns: tables, relationships, FKs, enums, timestamps, and conventions"
trigger: "when creating or modifying Drizzle ORM schema files in apps/server/src/db/schemas/"
---

## 文件位置

所有 schema 文件在 `apps/server/src/db/schemas/`，每个表或一组关联表一个文件。

## 基本规则

### 导入路径

```ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
```

### 主键

使用 UUID v4：

```ts
id: text("id")
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID());
```

### 时间戳

统一使用 `timestamp_ms` 模式：

```ts
createdAt: integer("created_at", { mode: "timestamp_ms" })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .notNull(),
updatedAt: integer("updated_at", { mode: "timestamp_ms" })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .$onUpdate(() => new Date())
  .notNull()
```

### 外部键引用

```ts
// 同文件引用
roleId: text("role_id")
  .notNull()
  .references(() => role.id, { onDelete: "cascade" });

// 跨文件引用 — import 目标表
import { user } from "./auth";
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" });

// 自引用 (parentId) — 需要 AnySQLiteColumn
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
parentId: text("parent_id").references((): AnySQLiteColumn => department.id);
```

### 枚举

D1/SQLite 没有原生 enum，用 `text` + `enum` 数组做类型约束：

```ts
status: text("status", { enum: ["draft", "published"] }).default("draft").notNull(),
dataScope: text("data_scope", {
  enum: ["all", "department", "department_and_sub", "self"]
}).default("self").notNull(),
```

### 布尔值

SQLite 没有布尔类型，用 `integer` + `{ mode: "boolean" }`：

```ts
isBuiltIn: integer("is_built_in", { mode: "boolean" }).default(false).notNull(),
visible: integer("visible", { mode: "boolean" }).notNull()
```

## 注册流程

每新建一个 schema 文件，需要注册到 `apps/server/src/db/schemas/index.ts`，`drizzle.ts` 会自动使用 `schemas` 的集中导出。

```ts
import { department } from "./department";
import { role, rolePermission } from "./role";

export const schemas = { department, role, rolePermission };
```

## 种子数据

### 文件位置

每个模块在 `apps/server/src/db/seeds/` 下对应一个文件，在 `seed/index.ts` 中调用。

### 数据和注入分离

种子文件分为两个明确的部分：**数据定义** + **注入函数**。数据定义放在函数外部，注入函数负责与数据库交互。

```ts
// ── 数据定义 ──
const rolesData = [{ id: "seed-role-admin", name: "管理员", dataScope: "all" }];

// ── 注入 ──
export async function seedRole(db: LibSQLDatabase) {
  await db.delete(role);
  for (const r of rolesData) {
    await db.insert(role).values(r);
  }
}
```

### 固定 ID

种子数据使用固定的可读 ID（如 `seed-role-admin`、`seed-dept-rd`），方便其他种子文件通过 ID 引用（如部门的 `defaultRoleId`），也方便后续手动查询验证。

### 足够的测试数据

- 每个选项/枚举值都覆盖到（如 dataScope 的 4 种取值）
- 树形结构至少 3 层（如 总部 → 研发部 → 前端组）
- 权限、字段掩码等配置要有差异，方便测试不同角色的展示效果

### 注入顺序

在 `seed/index.ts` 中按依赖顺序调用：被引用的表先 seed。

```ts
await seedRole(seedDb); // department 依赖 role.id
await seedDepartment(seedDb); // userDepartment 依赖 department.id
await seedUser(seedAuth); // 最后创建用户
```

## 验证

所有 schema 文件、注册和种子完成后，运行以下命令验证可行性：

```bash
cd apps/server && bun db:reset
```

这会在本地 D1 数据库上依次执行：清空全部表 → 按最新 schema 重建 → 写入种子数据。无报错即验证通过。
