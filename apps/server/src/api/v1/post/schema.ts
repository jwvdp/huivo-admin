import { z } from "@hono/zod-openapi";

export const postSchema = z.object({
  content: z.string(),
  createdAt: z.string(),
  id: z.string(),
  status: z.enum(["draft", "published"]),
  title: z.string(),
  updatedAt: z.string()
});

export const createPostSchema = z.object({
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  title: z.string().min(1).max(200)
});

export const updatePostSchema = z.object({
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  title: z.string().min(1).max(200).optional()
});
