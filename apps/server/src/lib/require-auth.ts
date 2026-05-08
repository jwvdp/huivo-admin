import { createMiddleware } from "hono/factory";

import type { AppBindings } from "../api/common";

import { getAuth } from "./better-auth";

export const requireAuth = createMiddleware<AppBindings>(async (c, next) => {
  const auth = getAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });

  const userId = session?.user?.id;
  if (!userId) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  c.set("userId", userId);
  await next();
});
