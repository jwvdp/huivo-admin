import type * as React from "react";

import { Link } from "@tanstack/react-router";
import { Building2, Shield, SquareTerminal, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/better-auth-client";
import { NavUser } from "@/routes/_protected/components/sidebar/nav-user";

import { NavGroup } from "./nav-group";

const sidebarItems = [
  {
    icon: SquareTerminal,
    items: [
      {
        icon: SquareTerminal,
        title: "订单",
        url: "/sales/orders"
      },
      {
        icon: SquareTerminal,
        title: "客户",
        url: "/sales/clients"
      }
    ],
    title: "销售"
  },
  {
    icon: SquareTerminal,
    items: [
      {
        icon: SquareTerminal,
        title: "资源",
        url: "/production/resources"
      }
    ],
    title: "生产",
    url: "/production"
  },
  {
    icon: Building2,
    items: [
      { icon: Building2, title: "部门管理", url: "/iam/departments" },
      { icon: Shield, title: "角色管理", url: "/iam/roles" },
      { icon: Users, title: "用户管理", url: "/iam/users" }
    ],
    title: "系统管理"
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const user = session?.user ?? {
    avatar: "",
    email: "",
    name: "Guest"
  };

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
            >
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-bold">汇合</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span>汇合数据管理系统</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarItems.map((item) => (
          <NavGroup
            key={item.title}
            title={item.title}
            items={item.items}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
