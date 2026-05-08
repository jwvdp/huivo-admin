import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../../common";

import { requireAuth } from "../../../lib/require-auth";
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  listPostHandler,
  updatePostHandler
} from "./handler";
import {
  createPostRoute,
  deletePostRoute,
  getPostRoute,
  listPostRoute,
  updatePostRoute
} from "./route";

const app = new OpenAPIHono<AppBindings>().use(
  "*",
  requireAuth
) as OpenAPIHono<AppBindings>;

export const postApp = app
  .openapi(listPostRoute, listPostHandler)
  .openapi(createPostRoute, createPostHandler)
  .openapi(getPostRoute, getPostHandler)
  .openapi(updatePostRoute, updatePostHandler)
  .openapi(deletePostRoute, deletePostHandler);
