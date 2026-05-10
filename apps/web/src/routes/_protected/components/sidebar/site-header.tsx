import { Link, useMatches } from "@tanstack/react-router";
import { SidebarIcon } from "lucide-react";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { SearchForm } from "@/routes/_protected/components/sidebar/search-form";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  new: "New",
  post: "Posts"
};

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const matches = useMatches();
  const leafMatch = matches.at(-1);

  // Build breadcrumbs from the URL path, not the match tree
  // (parent routes like /post/ are not in matches when on /post/$postId)
  const pathSegments = (leafMatch?.pathname ?? "/").split("/").filter(Boolean);
  const leafRouteSegment =
    (leafMatch?.routeId ?? "").split("/").findLast(Boolean) ?? "";

  const crumbs = pathSegments.map((segment, i) => {
    const crumbPath = `/${pathSegments.slice(0, i + 1).join("/")}`;
    const isLast = i === pathSegments.length - 1;

    const label =
      isLast && leafRouteSegment.startsWith("$")
        ? "Details"
        : (labelMap[segment] ??
          segment.charAt(0).toUpperCase() + segment.slice(1));

    return { id: crumbPath, label, pathname: crumbPath };
  });

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
        >
          <SidebarIcon />
        </Button>
        <Separator
          className="mr-2 h-4"
          orientation="vertical"
        />
        {crumbs.length > 0 && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.id}>
                  <BreadcrumbItem>
                    {index < crumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.pathname}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < crumbs.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
