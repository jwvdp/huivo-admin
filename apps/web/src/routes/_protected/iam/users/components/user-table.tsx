import type { UserWithRole } from "@huivo-admin/types";

import { UserCog } from "lucide-react";

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

export function UserTable({
  users,
  onAssignRole
}: {
  users: UserWithRole[];
  onAssignRole: (user: UserWithRole) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <Badge
                        key={r.roleId}
                        variant="secondary"
                      >
                        {r.roleName}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      未分配
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onAssignRole(user)}
                >
                  <UserCog />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
