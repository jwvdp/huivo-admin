import type { Role } from "@huivo-admin/types";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function RoleTable({
  roles,
  dataScopeLabels,
  onEdit,
  onDelete
}: {
  roles: Role[];
  dataScopeLabels: Record<string, string>;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>数据范围</TableHead>
            <TableHead>类型</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {role.description || "-"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {dataScopeLabels[role.dataScope] ?? role.dataScope}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={role.isBuiltIn ? "default" : "outline"}>
                  {role.isBuiltIn ? "内置" : "自定义"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(role)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={role.isBuiltIn}
                    onClick={() => onDelete(role)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
