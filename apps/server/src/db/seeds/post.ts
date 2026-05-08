import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { post } from "../schemas/post";

export async function seedPost(db: LibSQLDatabase) {
  await db.delete(post);
  await db.insert(post).values([
    {
      content:
        "This is a comprehensive guide to get you started with our platform.",
      status: "published",
      title: "Getting Started"
    },
    {
      content:
        "Learn about the advanced features available in the latest release.",
      status: "draft",
      title: "Advanced Features"
    },
    {
      content: "Best practices for building robust applications.",
      status: "published",
      title: "Best Practices"
    }
  ]);
}
