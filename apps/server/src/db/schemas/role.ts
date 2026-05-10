import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const role = sqliteTable("role", {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  dataScope: text("data_scope", {
    enum: ["all", "department", "department_and_sub", "self"]
  })
    .default("self")
    .notNull(),
  description: text("description").default("").notNull(),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  isBuiltIn: integer("is_built_in", { mode: "boolean" })
    .default(false)
    .notNull(),
  name: text("name").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull()
});

export const rolePermission = sqliteTable("role_permission", {
  action: text("action").notNull(),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  resource: text("resource").notNull(),
  roleId: text("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "cascade" })
});

export const userRole = sqliteTable("user_role", {
  roleId: text("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
});

export const resourceField = sqliteTable("resource_field", {
  field: text("field").notNull(),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull(),
  resource: text("resource").notNull()
});

export const roleFieldPermission = sqliteTable("role_field_permission", {
  field: text("field").notNull(),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  resource: text("resource").notNull(),
  roleId: text("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "cascade" }),
  visible: integer("visible", { mode: "boolean" }).notNull()
});
