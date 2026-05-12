import type { Department } from "@huivo-admin/types";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NULL_SENTINEL,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { rpc } from "@/lib/hono-rpc-client";

function isChildOf(
  id: string,
  targetParentId: string,
  departments: { id: string; parentId: string | null }[]
): boolean {
  const parentMap = new Map(departments.map((d) => [d.id, d.parentId]));
  let current = parentMap.get(id);
  while (current) {
    if (current === targetParentId) {
      return true;
    }
    current = parentMap.get(current);
  }
  return false;
}

interface DeptFormPayload {
  defaultRoleId: string | null;
  name: string;
  order: number;
  parentId: string | null;
}

export function DeptFormDialog({
  open,
  onOpenChange,
  editingDept,
  roles,
  onSuccess,
  onCreate,
  onUpdate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDept: Department | null;
  roles: { id: string; name: string }[];
  onSuccess: () => void;
  onCreate: (payload: DeptFormPayload) => Promise<void>;
  onUpdate: (departmentId: string, payload: DeptFormPayload) => Promise<void>;
}) {
  const { data: flatDepts } = rpc.api.v1.department.$get.useQuery();
  const isEdit = !!editingDept;

  const form = useForm({
    defaultValues: {
      defaultRoleId: editingDept?.defaultRoleId ?? null,
      name: editingDept?.name ?? "",
      order: editingDept?.order ?? 0,
      parentId: editingDept?.parentId ?? null
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await onUpdate(editingDept.id, value);
        onSuccess();
        return;
      }

      await onCreate(value);
      onSuccess();
    },
    validators: {
      onSubmit: z.object({
        defaultRoleId: z.string().nullable(),
        name: z.string().min(1, "名称不能为空").max(100),
        order: z.number().int(),
        parentId: z.string().nullable()
      })
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑部门" : "新增部门"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel>部门名称</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="parentId">
              {(field) => (
                <Field>
                  <FieldLabel>上级部门</FieldLabel>
                  <Select
                    value={field.state.value ?? NULL_SENTINEL}
                    onValueChange={(v) =>
                      field.handleChange(v === NULL_SENTINEL ? null : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="无（顶级部门）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NULL_SENTINEL}>
                        无（顶级部门）
                      </SelectItem>
                      {(flatDepts ?? [])
                        .filter(
                          (d) =>
                            !isEdit ||
                            (d.id !== editingDept.id &&
                              !isChildOf(d.id, editingDept.id, flatDepts ?? []))
                        )
                        .map((d) => (
                          <SelectItem
                            key={d.id}
                            value={d.id}
                          >
                            {d.fullPath}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="order">
              {(field) => (
                <Field>
                  <FieldLabel>排序</FieldLabel>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="defaultRoleId">
              {(field) => (
                <Field>
                  <FieldLabel>默认角色</FieldLabel>
                  <Select
                    value={field.state.value ?? NULL_SENTINEL}
                    onValueChange={(v) =>
                      field.handleChange(v === NULL_SENTINEL ? null : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="无默认角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NULL_SENTINEL}>无默认角色</SelectItem>
                      {roles.map((r) => (
                        <SelectItem
                          key={r.id}
                          value={r.id}
                        >
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isEdit ? "保存" : "创建"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
