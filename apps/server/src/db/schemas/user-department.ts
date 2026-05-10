import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { department } from "./department";

export const userDepartment = sqliteTable("user_department", {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id, { onDelete: "cascade" }),
  isHead: integer("is_head", { mode: "boolean" }).default(false).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
});
