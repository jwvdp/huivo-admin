import type { DepartmentTreeNode } from "@huivo-admin/types";

import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
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

import { DeptFormDialog } from "./components/department-form-dialog";
import { DepartmentTree } from "./components/department-tree";
import { DepartmentTreeSkeleton } from "./components/department-tree-skeleton";

export const Route = createFileRoute("/_protected/iam/departments/")({
  component: RouteComponent
});

function RouteComponent() {
  const { data: tree, isLoading } = rpc.api.v1.department.tree.$get.useQuery();
  const { data: roles } = rpc.api.v1.role.$get.useQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentTreeNode | null>(
    null
  );
  const [deletingDept, setDeletingDept] = useState<DepartmentTreeNode | null>(
    null
  );

  const createMutation = rpc.api.v1.department.$post.useMutation({
    invalidate: [
      rpc.api.v1.department.$get.getQueryKey(),
      rpc.api.v1.department.tree.$get.getQueryKey()
    ],
    onError: (err) => toast.error(err.message)
  });

  const updateMutation = rpc.api.v1.department[
    ":departmentId"
  ].$patch.useMutation({
    invalidate: [
      rpc.api.v1.department.$get.getQueryKey(),
      rpc.api.v1.department.tree.$get.getQueryKey()
    ],
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = rpc.api.v1.department[
    ":departmentId"
  ].$delete.useMutation({
    invalidate: [
      rpc.api.v1.department.$get.getQueryKey(),
      rpc.api.v1.department.tree.$get.getQueryKey()
    ],
    onError: (err) => toast.error(err.message)
  });

  const handleDelete = async () => {
    if (!deletingDept) {
      return;
    }
    await deleteMutation.mutateAsync({
      param: { departmentId: deletingDept.id }
    });
    toast.success("部门已删除");
    setDeletingDept(null);
  };

  if (isLoading) {
    return <DepartmentTreeSkeleton />;
  }

  const treeData = (tree ?? []) as DepartmentTreeNode[];

  return (
    <div className="space-y-6">
      <PageTitle
        title="部门管理"
        subtitle="管理组织架构，创建和编辑部门"
      >
        <Button
          onClick={() => {
            setEditingDept(null);
            setDialogOpen(true);
          }}
        >
          <Plus />
          新增部门
        </Button>
      </PageTitle>

      <DepartmentTree
        treeData={treeData}
        onCreate={() => {
          setEditingDept(null);
          setDialogOpen(true);
        }}
        onEdit={(dept) => {
          setEditingDept(dept);
          setDialogOpen(true);
        }}
        onDelete={setDeletingDept}
      />

      <DeptFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingDept={editingDept}
        roles={roles ?? []}
        onSuccess={() => {
          setDialogOpen(false);
          toast.success(editingDept ? "部门已更新" : "部门已创建");
        }}
        onCreate={async (data) => {
          await createMutation.mutateAsync({ json: data });
        }}
        onUpdate={async (departmentId, data) => {
          await updateMutation.mutateAsync({
            json: data,
            param: { departmentId }
          });
        }}
      />

      <AlertDialog
        open={!!deletingDept}
        onOpenChange={(open) => !open && setDeletingDept(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deletingDept?.name}
              」吗？如果部门下有子部门，将无法删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
