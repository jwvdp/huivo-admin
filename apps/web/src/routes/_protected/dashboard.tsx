import { createFileRoute } from "@tanstack/react-router";

import { PageTitle } from "@/routes/_protected/components/page-title";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        subtitle="Your dashboard overview"
      />
    </div>
  );
}
