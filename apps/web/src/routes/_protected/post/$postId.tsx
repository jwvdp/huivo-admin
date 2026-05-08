import { createFileRoute } from "@tanstack/react-router";

import { Spinner } from "@/components/ui/spinner";
import { rpc } from "@/lib/hono-rpc-client";
import { PageTitle } from "@/routes/_protected/components/page-title";

import { EditPostForm } from "./components/edit-post-form";

export const Route = createFileRoute("/_protected/post/$postId")({
  component: RouteComponent
});

function RouteComponent() {
  const { postId } = Route.useParams();

  const { data: postItem, isPending } = rpc.api.v1.post[
    ":postId"
  ].$get.useQuery({ param: { postId } });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!postItem) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Post not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title={postItem.title || "(untitled)"}
        subtitle="Edit post"
      />
      <EditPostForm
        postId={postId}
        postItem={postItem}
      />
    </div>
  );
}
