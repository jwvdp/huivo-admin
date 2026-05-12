import type { DepartmentTreeNode } from "@huivo-admin/types";

import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DeptTreeNode({
  node,
  depth,
  onEdit,
  onDelete
}: {
  node: DepartmentTreeNode;
  depth: number;
  onEdit: (dept: DepartmentTreeNode) => void;
  onDelete: (dept: DepartmentTreeNode) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5 last:border-b-0 hover:bg-muted/50"
        style={{ paddingLeft: 12 + depth * 24 }}
      >
        <button
          type="button"
          className={`size-4 shrink-0 ${hasChildren ? "visible" : "invisible"}`}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight
            className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
        <span className="min-w-0 flex-1 truncate text-sm">{node.name}</span>
        <span className="mr-4 text-xs text-muted-foreground">{node.slug}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(node)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(node)}
        >
          <Trash2 />
        </Button>
      </div>
      {expanded &&
        hasChildren &&
        node.children?.map((child) => (
          <DeptTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}
