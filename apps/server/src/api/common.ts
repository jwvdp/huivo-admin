import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";

import { z } from "@hono/zod-openapi";

export function jsonBody<T extends z.ZodType>(schema: T) {
  return {
    content: {
      "application/json": {
        schema
      }
    }
  };
}

export function jsonResponse<T extends z.ZodType>(
  schema: T,
  description = "Response successful"
) {
  return {
    content: {
      "application/json": {
        schema
      }
    },
    description
  };
}

export function errorResponse(description = "Error response") {
  const errorSchema = z.object({ message: z.string() });
  return jsonResponse(errorSchema, description);
}

export interface AppBindings {
  Bindings: Env;
  Variables: {
    userId?: string;
    roleNames?: string[];
    dataScope?: string;
  };
}

// 拼接 OpenApi 的提供的 AppBindings 类型到 Hadnler 的 c 对象中。
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
