import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "../../common";
import type {
  CreateDepartmentRoute,
  DeleteDepartmentRoute,
  GetDepartmentRoute,
  ListDepartmentRoute,
  TreeDepartmentRoute,
  UpdateDepartmentRoute
} from "./route";

import { department as departmentTable } from "../../../db/schemas/department";
import { db } from "../../../lib/drizzle";

export const listDepartmentHandler: AppRouteHandler<
  ListDepartmentRoute
> = async (c) => {
  const departments = await db(c.env)
    .select()
    .from(departmentTable)
    .orderBy(departmentTable.order);

  return c.json(departments, 200);
};

export const treeDepartmentHandler: AppRouteHandler<
  TreeDepartmentRoute
> = async (c) => {
  const departments = await db(c.env)
    .select()
    .from(departmentTable)
    .orderBy(departmentTable.order);

  function buildTree(parentId: string | null): unknown[] {
    return departments
      .filter((d) => d.parentId === parentId)
      .map((d) => ({
        ...d,
        children: buildTree(d.id)
      }));
  }

  return c.json(buildTree(null), 200);
};

export const createDepartmentHandler: AppRouteHandler<
  CreateDepartmentRoute
> = async (c) => {
  const body = c.req.valid("json");
  const { name, parentId, order, defaultRoleId } = body;

  let slug = name
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "");

  // 如果 slug 为空（中文名），用随机后缀
  if (!slug) {
    slug = `dept-${crypto.randomUUID().slice(0, 8)}`;
  }

  // 生成 fullPath
  let fullPath = `/${name}`;
  if (parentId) {
    const parent = await db(c.env)
      .select({ fullPath: departmentTable.fullPath })
      .from(departmentTable)
      .where(eq(departmentTable.id, parentId))
      .limit(1)
      .then((r) => r[0]);

    if (parent) {
      fullPath = `${parent.fullPath}/${name}`;
    }
  }

  const id = crypto.randomUUID();
  await db(c.env)
    .insert(departmentTable)
    .values({
      defaultRoleId: defaultRoleId ?? null,
      fullPath,
      headUserId: null,
      id,
      name,
      order: order ?? 0,
      parentId: parentId ?? null,
      slug
    });

  const created = await db(c.env)
    .select()
    .from(departmentTable)
    .where(eq(departmentTable.id, id))
    .limit(1)
    .then((r) => r[0]);

  return c.json(created, 200);
};

export const getDepartmentHandler: AppRouteHandler<GetDepartmentRoute> = async (
  c
) => {
  const { departmentId } = c.req.valid("param");

  const dept = await db(c.env)
    .select()
    .from(departmentTable)
    .where(eq(departmentTable.id, departmentId))
    .limit(1)
    .then((r) => r[0]);

  if (!dept) {
    return c.json({ message: "Department not found" }, 404);
  }

  return c.json(dept, 200);
};

export const updateDepartmentHandler: AppRouteHandler<
  UpdateDepartmentRoute
> = async (c) => {
  const { departmentId } = c.req.valid("param");
  const body = c.req.valid("json");

  // 检查存在
  const existing = await db(c.env)
    .select({ id: departmentTable.id })
    .from(departmentTable)
    .where(eq(departmentTable.id, departmentId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ message: "Department not found" }, 404);
  }

  await db(c.env)
    .update(departmentTable)
    .set(body)
    .where(eq(departmentTable.id, departmentId));

  const updated = await db(c.env)
    .select()
    .from(departmentTable)
    .where(eq(departmentTable.id, departmentId))
    .limit(1)
    .then((r) => r[0]);

  return c.json(updated, 200);
};

export const deleteDepartmentHandler: AppRouteHandler<
  DeleteDepartmentRoute
> = async (c) => {
  const { departmentId } = c.req.valid("param");

  // 检查存在
  const existing = await db(c.env)
    .select({ id: departmentTable.id })
    .from(departmentTable)
    .where(eq(departmentTable.id, departmentId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ message: "Department not found" }, 404);
  }

  // 检查子部门
  const children = await db(c.env)
    .select({ id: departmentTable.id })
    .from(departmentTable)
    .where(eq(departmentTable.parentId, departmentId))
    .limit(1)
    .then((r) => r[0]);

  if (children) {
    return c.json({ message: "Has child departments" }, 400);
  }

  await db(c.env)
    .delete(departmentTable)
    .where(eq(departmentTable.id, departmentId));

  return c.json({ id: departmentId }, 200);
};
