import { createFileRoute } from "@tanstack/react-router";

import { CreatePostForm } from "./components/create-post-form";

export const Route = createFileRoute("/_protected/post/new")({
  component: RouteComponent
});

function RouteComponent() {
  return <CreatePostForm />;
}
