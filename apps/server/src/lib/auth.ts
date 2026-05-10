import type { OpenAPIHono } from "@hono/zod-openapi";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import type { AppBindings } from "../api/common";

import { role, rolePermission, userRole } from "../db/schemas/role";
import { db } from "./drizzle";

export const getAuth = (env: Env) => {
  if (env.huivo_admin_database === undefined) {
    throw new Error("huivo_admin_database is not set");
  }

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db(env), {
      provider: "sqlite"
    }),
    emailAndPassword: {
      enabled: true
    }
  });
};

export const withAuth = (app: OpenAPIHono<AppBindings>) => {
  app.on(["GET", "POST"], "/api/v1/auth/*", (c) => {
    const auth = getAuth(c.env);
    return auth.handler(c.req.raw);
  });
};

export const requireAuth = createMiddleware<AppBindings>(async (c, next) => {
  const auth = getAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });

  const userId = session?.user?.id;
  if (!userId) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const authInfo = await getUserAuthInfo(c.env, userId);

  c.set("userId", userId);
  c.set("roleNames", authInfo.roleNames);
  c.set("dataScope", authInfo.dataScope);

  await next();
});

export interface UserAuthInfo {
  userId: string;
  roleNames: string[];
  permissions: { resource: string; action: string }[];
  dataScope: string;
}

export async function getUserAuthInfo(
  env: Env,
  userId: string
): Promise<UserAuthInfo> {
  // 查角色
  const roleRows = await db(env)
    .select({
      dataScope: role.dataScope,
      name: role.name
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId));

  // 查权限
  const permRows = await db(env)
    .select({
      action: rolePermission.action,
      resource: rolePermission.resource
    })
    .from(rolePermission)
    .innerJoin(userRole, eq(rolePermission.roleId, userRole.roleId))
    .where(eq(userRole.userId, userId));

  // dataScope 取最大范围
  const scopeRank: Record<string, number> = {
    all: 3,
    department: 1,
    department_and_sub: 2,
    self: 0
  };
  let dataScope = "self";
  for (const r of roleRows) {
    if ((scopeRank[r.dataScope] ?? 0) > (scopeRank[dataScope] ?? 0)) {
      ({ dataScope } = r);
    }
  }

  return {
    dataScope,
    permissions: permRows,
    roleNames: roleRows.map((r) => r.name),
    userId
  };
}
