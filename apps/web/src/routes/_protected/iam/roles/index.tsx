import type { Role } from "@huivo-admin/types";

import { createFileRoute } from "@tanstack/react-router";
import { Plus, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { rpc } from "@/lib/hono-rpc-client";
import { PageTitle } from "@/routes/_protected/components/page-title";

import { RoleFormDialog } from "./components/role-form-dialog";
import { RoleTable } from "./components/role-table";
import { RoleTableSkeleton } from "./components/role-table-skeleton";

export const Route = createFileRoute("/_protected/iam/roles/")({
  component: RouteComponent
});

function RouteComponent() {
  const { data: roles, isLoading } = rpc.api.v1.role.$get.useQuery();
  const { data: config } = rpc.api.v1.config.permissions.$get.useQuery();
  const dataScopeLabels = Object.fromEntries(
    config?.dataScopeOptions.map((o) => [o.value, o.label]) ?? []
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const createMutation = rpc.api.v1.role.$post.useMutation({
    invalidate: [rpc.api.v1.role.$get.getQueryKey()],
    onError: (err) => toast.error(err.message)
  });

  const updateMutation = rpc.api.v1.role[":roleId"].$patch.useMutation({
    invalidate: [rpc.api.v1.role.$get.getQueryKey()],
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = rpc.api.v1.role[":roleId"].$delete.useMutation({
    invalidate: [rpc.api.v1.role.$get.getQueryKey()],
    onError: (err) => toast.error(err.message)
  });

  const handleDelete = async () => {
    if (!deletingRole) {
      return;
    }
    await deleteMutation.mutateAsync({
      param: { roleId: deletingRole.id }
    });
    toast.success("角色已删除");
    setDeletingRole(null);
  };

  if (isLoading) {
    return <RoleTableSkeleton />;
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="角色管理"
          subtitle="管理系统角色及其权限配置"
        >
          <Button
            onClick={() => {
              setEditingRole(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            新增角色
          </Button>
        </PageTitle>

        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Shield className="size-12" />
          <p>暂无角色</p>
          <Button
            variant="outline"
            onClick={() => {
              setEditingRole(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            新增角色
          </Button>
        </div>

        <RoleFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingRole={editingRole}
          onSuccess={() => {
            setDialogOpen(false);
            toast.success(editingRole ? "角色已更新" : "角色已创建");
          }}
          onCreate={async (data) => {
            await createMutation.mutateAsync({ json: data });
          }}
          onUpdate={async (roleId, data) => {
            await updateMutation.mutateAsync({ json: data, param: { roleId } });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="角色管理"
        subtitle="管理系统角色及其权限配置"
      >
        <Button
          onClick={() => {
            setEditingRole(null);
            setDialogOpen(true);
          }}
        >
          <Plus />
          新增角色
        </Button>
      </PageTitle>

      <RoleTable
        roles={roles}
        dataScopeLabels={dataScopeLabels}
        onEdit={(role) => {
          setEditingRole(role);
          setDialogOpen(true);
        }}
        onDelete={setDeletingRole}
      />

      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRole={editingRole}
        onSuccess={() => {
          setDialogOpen(false);
          toast.success(editingRole ? "角色已更新" : "角色已创建");
        }}
        onCreate={async (data) => {
          await createMutation.mutateAsync({ json: data });
        }}
        onUpdate={async (roleId, data) => {
          await updateMutation.mutateAsync({ json: data, param: { roleId } });
        }}
      />

      <AlertDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingRole?.isBuiltIn
                ? "内置角色不可删除。"
                : `确定要删除角色「${deletingRole?.name}」吗？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            {!deletingRole?.isBuiltIn && (
              <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
