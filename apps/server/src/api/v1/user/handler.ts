import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "../../common";
import type { ListUserRoute, UpdateUserRolesRoute } from "./route";

import { user as userTable } from "../../../db/schemas/auth";
import {
  role as roleTable,
  userRole as userRoleTable
} from "../../../db/schemas/role";
import { db } from "../../../lib/drizzle";

export const listUserHandler: AppRouteHandler<ListUserRoute> = async (c) => {
  const rows = await db(c.env)
    .select({
      createdAt: userTable.createdAt,
      email: userTable.email,
      id: userTable.id,
      image: userTable.image,
      name: userTable.name,
      roleId: userRoleTable.roleId,
      roleName: roleTable.name,
      updatedAt: userTable.updatedAt
    })
    .from(userTable)
    .leftJoin(userRoleTable, eq(userTable.id, userRoleTable.userId))
    .leftJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
    .orderBy(userTable.createdAt);

  // 按用户分组，合并角色数组
  const userMap = new Map<
    string,
    {
      createdAt: number;
      email: string;
      id: string;
      image: string | null;
      name: string;
      roles: { roleId: string; roleName: string }[];
      updatedAt: number;
    }
  >();

  for (const row of rows) {
    const existing = userMap.get(row.id);
    if (existing) {
      if (row.roleId) {
        existing.roles.push({
          roleId: row.roleId,
          roleName: row.roleName ?? ""
        });
      }
    } else {
      userMap.set(row.id, {
        createdAt: Number(row.createdAt),
        email: row.email,
        id: row.id,
        image: row.image,
        name: row.name,
        roles: row.roleId
          ? [{ roleId: row.roleId, roleName: row.roleName ?? "" }]
          : [],
        updatedAt: Number(row.updatedAt)
      });
    }
  }

  return c.json([...userMap.values()], 200);
};

export const updateUserRolesHandler: AppRouteHandler<
  UpdateUserRolesRoute
> = async (c) => {
  const { userId } = c.req.valid("param");
  const { roleIds } = c.req.valid("json");

  const existing = await db(c.env)
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ message: "User not found" }, 404);
  }

  // 批量替换角色
  await db(c.env).delete(userRoleTable).where(eq(userRoleTable.userId, userId));

  if (roleIds.length > 0) {
    await db(c.env)
      .insert(userRoleTable)
      .values(roleIds.map((roleId) => ({ roleId, userId })));
  }

  return c.json({ roleIds, userId }, 200);
};
