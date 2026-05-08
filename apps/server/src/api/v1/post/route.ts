import { createRoute, z } from "@hono/zod-openapi";

import { errorResponse, jsonBody, jsonResponse } from "../../common";
import { createPostSchema, postSchema, updatePostSchema } from "./schema";

const postParamsSchema = z.object({
  postId: z.string().min(1)
});

export const listPostRoute = createRoute({
  description: "List all posts",
  method: "get",
  path: "/",
  responses: {
    200: jsonResponse(z.array(postSchema))
  },
  summary: "List posts",
  tags: ["post"]
});

export const createPostRoute = createRoute({
  description: "Create a new post",
  method: "post",
  path: "/",
  request: {
    body: jsonBody(createPostSchema)
  },
  responses: {
    200: jsonResponse(postSchema)
  },
  summary: "Create post",
  tags: ["post"]
});

export const getPostRoute = createRoute({
  description: "Get a post by id",
  method: "get",
  path: "/:postId",
  request: {
    params: postParamsSchema
  },
  responses: {
    200: jsonResponse(postSchema),
    404: errorResponse("Post not found")
  },
  summary: "Get post",
  tags: ["post"]
});

export const updatePostRoute = createRoute({
  description: "Update a post",
  method: "patch",
  path: "/:postId",
  request: {
    body: jsonBody(updatePostSchema),
    params: postParamsSchema
  },
  responses: {
    200: jsonResponse(postSchema),
    404: errorResponse("Post not found")
  },
  summary: "Update post",
  tags: ["post"]
});

export const deletePostRoute = createRoute({
  description: "Delete a post",
  method: "delete",
  path: "/:postId",
  request: {
    params: postParamsSchema
  },
  responses: {
    200: jsonResponse(z.object({ id: z.string() })),
    404: errorResponse("Post not found")
  },
  summary: "Delete post",
  tags: ["post"]
});

export type ListPostRoute = typeof listPostRoute;
export type CreatePostRoute = typeof createPostRoute;
export type GetPostRoute = typeof getPostRoute;
export type UpdatePostRoute = typeof updatePostRoute;
export type DeletePostRoute = typeof deletePostRoute;
