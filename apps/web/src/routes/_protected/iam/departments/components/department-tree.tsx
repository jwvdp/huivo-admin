import type { DepartmentTreeNode } from "@huivo-admin/types";

import { Building2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DeptTreeNode } from "./department-tree-node";

export function DepartmentTree({
  treeData,
  onCreate,
  onEdit,
  onDelete
}: {
  treeData: DepartmentTreeNode[];
  onCreate: () => void;
  onEdit: (dept: DepartmentTreeNode) => void;
  onDelete: (dept: DepartmentTreeNode) => void;
}) {
  if (treeData.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-muted-foreground">
        <Building2 className="size-12" />
        <p>暂无部门</p>
        <Button
          variant="outline"
          onClick={onCreate}
        >
          <Plus />
          新增部门
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      {treeData.map((node) => (
        <DeptTreeNode
          key={node.id}
          node={node}
          depth={0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
