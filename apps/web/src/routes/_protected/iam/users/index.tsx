import type { Role, UserWithRole as User } from "@huivo-admin/types";

import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";

import { rpc } from "@/lib/hono-rpc-client";
import { PageTitle } from "@/routes/_protected/components/page-title";

import { UserRoleDialog } from "./components/user-role-dialog";
import { UserTable } from "./components/user-table";
import { UserTableSkeleton } from "./components/user-table-skeleton";

export const Route = createFileRoute("/_protected/iam/users/")({
  component: RouteComponent
});

function RouteComponent() {
  const { data: users, isLoading } = rpc.api.v1.user.$get.useQuery();
  const { data: allRoles } = rpc.api.v1.role.$get.useQuery();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading) {
    return <UserTableSkeleton />;
  }

  if (!users || users.length === 0) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="用户管理"
          subtitle="管理系统用户及其角色分配"
        />

        <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-muted-foreground">
          <Users className="size-12" />
          <p>暂无用户</p>
        </div>

        <UserRoleDialog
          user={selectedUser}
          allRoles={(allRoles ?? []) as unknown as Role[]}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => setSelectedUser(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="用户管理"
        subtitle="管理系统用户及其角色分配"
      />

      <UserTable
        users={users}
        onAssignRole={setSelectedUser}
      />

      <UserRoleDialog
        user={selectedUser}
        allRoles={(allRoles ?? []) as unknown as Role[]}
        onClose={() => setSelectedUser(null)}
        onSuccess={() => setSelectedUser(null)}
      />
    </div>
  );
}
