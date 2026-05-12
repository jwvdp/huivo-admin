import type { Role, UserWithRole as User } from "@huivo-admin/types";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { rpc } from "@/lib/hono-rpc-client";

export function UserRoleDialog({
  user,
  allRoles,
  onClose,
  onSuccess
}: {
  user: User | null;
  allRoles: Role[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.roles.map((r) => r.roleId));
    }
  }, [user]);

  const updateMutation = rpc.api.v1.user[":userId"].roles.$patch.useMutation({
    invalidate: [rpc.api.v1.user.$get.getQueryKey()],
    onError: (err) => toast.error(err.message)
  });

  const handleSave = async () => {
    if (!user) {
      return;
    }

    await updateMutation.mutateAsync({
      json: { roleIds: selectedRoleIds },
      param: { userId: user.id }
    });
    toast.success("角色分配已更新");
    onSuccess();
    onClose();
  };

  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分配角色 — {user?.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">{user?.email}</p>
          <div className="space-y-3">
            {allRoles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedRoleIds.includes(role.id)}
                  onCheckedChange={(checked) => {
                    setSelectedRoleIds((prev) =>
                      checked
                        ? [...prev, role.id]
                        : prev.filter((id) => id !== role.id)
                    );
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{role.name}</span>
                    {role.isBuiltIn && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        内置
                      </Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
