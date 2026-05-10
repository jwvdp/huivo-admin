import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { role } from "./role";

export const department = sqliteTable("department", {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  defaultRoleId: text("default_role_id").references(() => role.id),
  fullPath: text("full_path").notNull(),
  headUserId: text("head_user_id").references(() => user.id),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  order: integer("order").default(0).notNull(),
  parentId: text("parent_id").references((): AnySQLiteColumn => department.id),
  slug: text("slug").notNull().unique(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull()
});
