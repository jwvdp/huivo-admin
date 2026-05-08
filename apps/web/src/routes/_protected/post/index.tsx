import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { rpc } from "@/lib/hono-rpc-client";
import { PageTitle } from "@/routes/_protected/components/page-title";

import { PostTable } from "./components/post-table";

export const Route = createFileRoute("/_protected/post/")({
  component: RouteComponent
});

function RouteComponent() {
  const { data: posts = [], isPending } = rpc.api.v1.post.$get.useQuery();

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Posts"
        subtitle="Manage your blog posts"
      >
        <Button asChild>
          <Link to="/post/new">
            <PlusIcon />
            New Post
          </Link>
        </Button>
      </PageTitle>
      <PostTable posts={posts} />
    </div>
  );
}
