import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "../../common";
import type {
  CreateRoleRoute,
  DeleteRoleRoute,
  ListRoleRoute,
  UpdateRoleRoute
} from "./route";

import {
  role as roleTable,
  roleFieldPermission as roleFieldPermissionTable,
  rolePermission as rolePermissionTable
} from "../../../db/schemas/role";
import { db } from "../../../lib/drizzle";

export const listRoleHandler: AppRouteHandler<ListRoleRoute> = async (c) => {
  const roles = await db(c.env)
    .select()
    .from(roleTable)
    .orderBy(roleTable.createdAt);

  const allPerms = await db(c.env).select().from(rolePermissionTable);
  const allFieldPerms = await db(c.env).select().from(roleFieldPermissionTable);

  const result = roles.map((r) => ({
    ...r,
    createdAt: Number(r.createdAt),
    fieldPermissions: allFieldPerms
      .filter((fp) => fp.roleId === r.id)
      .map((fp) => ({
        field: fp.field,
        resource: fp.resource,
        visible: fp.visible
      })),
    permissions: allPerms
      .filter((p) => p.roleId === r.id)
      .map((p) => ({ action: p.action, resource: p.resource })),
    updatedAt: Number(r.updatedAt)
  }));

  return c.json(result, 200);
};

export const createRoleHandler: AppRouteHandler<CreateRoleRoute> = async (
  c
) => {
  const body = c.req.valid("json");
  const { permissions, fieldPermissions, ...roleData } = body;

  const id = crypto.randomUUID();
  await db(c.env)
    .insert(roleTable)
    .values({
      dataScope: roleData.dataScope ?? "self",
      description: roleData.description ?? "",
      id,
      isBuiltIn: false,
      name: roleData.name
    });

  if (permissions && permissions.length > 0) {
    await db(c.env)
      .insert(rolePermissionTable)
      .values(
        permissions.map((p) => ({
          id: crypto.randomUUID(),
          roleId: id,
          ...p
        }))
      );
  }

  if (fieldPermissions && fieldPermissions.length > 0) {
    await db(c.env)
      .insert(roleFieldPermissionTable)
      .values(
        fieldPermissions.map((fp) => ({
          id: crypto.randomUUID(),
          roleId: id,
          ...fp
        }))
      );
  }

  const created = await db(c.env)
    .select()
    .from(roleTable)
    .where(eq(roleTable.id, id))
    .limit(1)
    .then((r) => r[0]);

  return c.json(
    {
      ...created,
      createdAt: Number(created.createdAt),
      fieldPermissions: fieldPermissions ?? [],
      permissions: permissions ?? [],
      updatedAt: Number(created.updatedAt)
    },
    200
  );
};

export const updateRoleHandler: AppRouteHandler<UpdateRoleRoute> = async (
  c
) => {
  const { roleId } = c.req.valid("param");
  const body = c.req.valid("json");
  const { permissions, fieldPermissions, ...roleData } = body;

  const existing = await db(c.env)
    .select({ id: roleTable.id })
    .from(roleTable)
    .where(eq(roleTable.id, roleId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ message: "Role not found" }, 404);
  }

  // 更新角色基本信息
  if (Object.keys(roleData).length > 0) {
    await db(c.env)
      .update(roleTable)
      .set(roleData)
      .where(eq(roleTable.id, roleId));
  }

  // 替换权限
  if (permissions !== undefined) {
    await db(c.env)
      .delete(rolePermissionTable)
      .where(eq(rolePermissionTable.roleId, roleId));

    if (permissions.length > 0) {
      await db(c.env)
        .insert(rolePermissionTable)
        .values(
          permissions.map((p) => ({
            id: crypto.randomUUID(),
            roleId,
            ...p
          }))
        );
    }
  }

  // 替换字段掩码
  if (fieldPermissions !== undefined) {
    await db(c.env)
      .delete(roleFieldPermissionTable)
      .where(eq(roleFieldPermissionTable.roleId, roleId));

    if (fieldPermissions.length > 0) {
      await db(c.env)
        .insert(roleFieldPermissionTable)
        .values(
          fieldPermissions.map((fp) => ({
            id: crypto.randomUUID(),
            roleId,
            ...fp
          }))
        );
    }
  }

  const updated = await db(c.env)
    .select()
    .from(roleTable)
    .where(eq(roleTable.id, roleId))
    .limit(1)
    .then((r) => r[0]);

  const perms = await db(c.env)
    .select()
    .from(rolePermissionTable)
    .where(eq(rolePermissionTable.roleId, roleId));

  const fieldPerms = await db(c.env)
    .select()
    .from(roleFieldPermissionTable)
    .where(eq(roleFieldPermissionTable.roleId, roleId));

  return c.json(
    {
      ...updated,
      createdAt: Number(updated.createdAt),
      fieldPermissions: fieldPerms.map((fp) => ({
        field: fp.field,
        resource: fp.resource,
        visible: fp.visible
      })),
      permissions: perms.map((p) => ({
        action: p.action,
        resource: p.resource
      })),
      updatedAt: Number(updated.updatedAt)
    },
    200
  );
};

export const deleteRoleHandler: AppRouteHandler<DeleteRoleRoute> = async (
  c
) => {
  const { roleId } = c.req.valid("param");

  const existing = await db(c.env)
    .select({ isBuiltIn: roleTable.isBuiltIn })
    .from(roleTable)
    .where(eq(roleTable.id, roleId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ message: "Role not found" }, 404);
  }

  if (existing.isBuiltIn) {
    return c.json({ message: "Built-in role cannot be deleted" }, 400);
  }

  await db(c.env).delete(roleTable).where(eq(roleTable.id, roleId));

  return c.json({ id: roleId }, 200);
};
