import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "../../common";
import type {
  CreatePostRoute,
  DeletePostRoute,
  GetPostRoute,
  ListPostRoute,
  UpdatePostRoute
} from "./route";

import { post } from "../../../db/schemas/post";
import { db } from "../../../lib/drizzle";

export const listPostHandler: AppRouteHandler<ListPostRoute> = async (c) => {
  const posts = await db(c.env).select().from(post);

  return c.json(posts, 200);
};

export const createPostHandler: AppRouteHandler<CreatePostRoute> = async (
  c
) => {
  const { content, status, title } = c.req.valid("json");

  const [newPost] = await db(c.env)
    .insert(post)
    .values({
      content: content ?? "",
      status: status ?? "draft",
      title
    })
    .returning();

  return c.json(newPost, 200);
};

export const getPostHandler: AppRouteHandler<GetPostRoute> = async (c) => {
  const { postId } = c.req.valid("param");

  const [foundPost] = await db(c.env)
    .select()
    .from(post)
    .where(eq(post.id, postId))
    .limit(1);

  if (!foundPost) {
    return c.json({ message: "Post not found" }, 404);
  }

  return c.json(foundPost, 200);
};

export const updatePostHandler: AppRouteHandler<UpdatePostRoute> = async (
  c
) => {
  const { postId } = c.req.valid("param");
  const { content, status, title } = c.req.valid("json");
  const updates: {
    content?: string;
    status?: "draft" | "published";
    title?: string;
  } = {};

  if (title !== undefined) {
    updates.title = title.trim();
  }

  if (content !== undefined) {
    updates.content = content;
  }

  if (status !== undefined) {
    updates.status = status;
  }

  const [updatedPost] = await db(c.env)
    .update(post)
    .set(updates)
    .where(eq(post.id, postId))
    .returning();

  if (!updatedPost) {
    return c.json({ message: "Post not found" }, 404);
  }

  return c.json(updatedPost, 200);
};

export const deletePostHandler: AppRouteHandler<DeletePostRoute> = async (
  c
) => {
  const { postId } = c.req.valid("param");

  const [deletedPost] = await db(c.env)
    .delete(post)
    .where(eq(post.id, postId))
    .returning({ id: post.id });

  if (!deletedPost) {
    return c.json({ message: "Post not found" }, 404);
  }

  return c.json(deletedPost, 200);
};
