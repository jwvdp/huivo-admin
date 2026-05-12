---
name: db-schema-definition
description: Use when creating or modifying Drizzle ORM table definitions in apps/server/src/db/schemas/
---

# DB Schema Definition

## Overview

Drizzle ORM schema files for D1 (SQLite). Each file covers one table or a group of related tables. Register new files in `apps/server/src/db/schemas/index.ts`.

## Imports

```ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
```

## Column Patterns

### Primary Key

UUID v4:

```ts
id: text("id")
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID());
```

### Timestamps

`timestamp_ms` mode, auto-set on create and update:

```ts
createdAt: integer("created_at", { mode: "timestamp_ms" })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .notNull(),
updatedAt: integer("updated_at", { mode: "timestamp_ms" })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .$onUpdate(() => new Date())
  .notNull()
```

### Foreign Keys

```ts
// Same file — direct reference
roleId: text("role_id")
  .notNull()
  .references(() => role.id, { onDelete: "cascade" });

// Cross-file — import target table
import { user } from "./auth";
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" });

// Self-reference (parentId) — needs AnySQLiteColumn
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
parentId: text("parent_id").references((): AnySQLiteColumn => department.id);
```

### Enums

SQLite has no native enum — use `text` + `enum` array:

```ts
status: text("status", { enum: ["draft", "published"] }).default("draft").notNull(),
dataScope: text("data_scope", {
  enum: ["all", "department", "department_and_sub", "self"]
}).default("self").notNull(),
```

### Booleans

Use `integer` + `{ mode: "boolean" }`:

```ts
isBuiltIn: integer("is_built_in", { mode: "boolean" }).default(false).notNull(),
```

## Registration

Register each new schema in `apps/server/src/db/schemas/index.ts`:

```ts
import { department } from "./department";
import { role, rolePermission } from "./role";

export const schemas = { department, role, rolePermission };
```

`drizzle.ts` automatically consumes the centralized `schemas` export.

## Verification

After schema changes, run:

```bash
cd apps/server && bun db:reset
```

This drops all tables, rebuilds from latest schemas, and reseeds. No errors = valid.

## Related Skills

- **db-seed-data** — seed data patterns for populating these tables
