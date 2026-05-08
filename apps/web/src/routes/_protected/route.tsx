import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/session";

import { AppSidebar } from "./components/sidebar/app-sidebar";
import { SiteHeader } from "./components/sidebar/site-header";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const { data: session } = await getSession();
    if (!session || !session.user) {
      throw redirect({ to: "/auth/login" });
    }
    return { session };
  },
  component: () => (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="p-8">
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
});
