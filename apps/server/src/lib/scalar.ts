import type { OpenAPIHono } from "@hono/zod-openapi";

import { Scalar } from "@scalar/hono-api-reference";

import type { AppBindings } from "../api/common";

export const withScalar = (app: OpenAPIHono<AppBindings>) => {
  app.doc("/api/doc", () => ({
    info: {
      title: "Go API Documentation",
      version: "1.0.0"
    },
    openapi: "3.0.0",
    servers: []
  }));

  app.get(
    "/api/scalar",
    Scalar({
      url: "/api/doc"
    })
  );
};
