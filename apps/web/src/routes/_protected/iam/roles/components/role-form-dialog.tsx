import type { Role } from "@huivo-admin/types";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { rpc } from "@/lib/hono-rpc-client";

interface RoleFormPayload {
  name: string;
  description: string;
  dataScope: "all" | "department" | "department_and_sub" | "self";
  permissions: { resource: string; action: string }[];
  fieldPermissions: { resource: string; field: string; visible: boolean }[];
}

export function RoleFormDialog({
  open,
  onOpenChange,
  editingRole,
  onSuccess,
  onCreate,
  onUpdate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: Role | null;
  onSuccess: () => void;
  onCreate: (payload: RoleFormPayload) => Promise<void>;
  onUpdate: (roleId: string, payload: RoleFormPayload) => Promise<void>;
}) {
  const isEdit = !!editingRole;

  const [permissions, setPermissions] = useState<
    { resource: string; action: string }[]
  >(editingRole?.permissions ?? []);

  const [fieldPermissions, setFieldPermissions] = useState<
    { resource: string; field: string; visible: boolean }[]
  >(editingRole?.fieldPermissions ?? []);

  const { data: config } = rpc.api.v1.config.permissions.$get.useQuery();
  const resources = config?.resources ?? [];
  const actions = config?.actions ?? [];
  const resourceFields = config?.resourceFields ?? {};
  const dataScopeOptions = config?.dataScopeOptions ?? [];

  useEffect(() => {
    if (open) {
      setPermissions(editingRole?.permissions ?? []);
      setFieldPermissions(editingRole?.fieldPermissions ?? []);
    }
  }, [open, editingRole]);

  const form = useForm({
    defaultValues: {
      dataScope: (editingRole?.dataScope ?? "self") as
        | "all"
        | "department"
        | "department_and_sub"
        | "self",
      description: editingRole?.description ?? "",
      name: editingRole?.name ?? ""
    },
    onSubmit: async ({ value }) => {
      const payload = { ...value, fieldPermissions, permissions };
      if (isEdit) {
        await onUpdate(editingRole.id, payload);
        onSuccess();

        return;
      }

      await onCreate(payload);
      onSuccess();
    },
    validators: {
      onSubmit: z.object({
        dataScope: z.enum(["all", "department", "department_and_sub", "self"]),
        description: z.string(),
        name: z.string().min(1, "名称不能为空").max(100)
      })
    }
  });

  const togglePermission = (resource: string, action: string) => {
    setPermissions((prev) => {
      const key = (p: { resource: string; action: string }) =>
        p.resource === resource && p.action === action;
      if (prev.some(key)) {
        return prev.filter((p) => !key(p));
      }

      return [...prev, { action, resource }];
    });
  };

  const toggleFieldPermission = (
    resource: string,
    field: string,
    visible: boolean
  ) => {
    setFieldPermissions((prev) => {
      const key = (fp: { resource: string; field: string; visible: boolean }) =>
        fp.resource === resource && fp.field === field;
      const existing = prev.find(key);
      if (existing) {
        return prev.map((fp) => (key(fp) ? { ...fp, visible } : fp));
      }

      return [...prev, { field, resource, visible }];
    });
  };

  const isPermissionChecked = (resource: string, action: string) =>
    permissions.some((p) => p.resource === resource && p.action === action);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑角色" : "新增角色"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">基本信息</h3>
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel>角色名称</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel>描述</FieldLabel>
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="dataScope">
                {(field) => (
                  <Field>
                    <FieldLabel>数据权限</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) =>
                        field.handleChange(
                          v as
                            | "all"
                            | "department"
                            | "department_and_sub"
                            | "self"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataScopeOptions.map(({ value, label }) => (
                          <SelectItem
                            key={value}
                            value={value}
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">权限配置</h3>
              {resources.map((resource) => (
                <div
                  key={resource}
                  className="rounded-lg border p-4"
                >
                  <p className="mb-2 text-sm font-medium capitalize">
                    {resource}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {actions.map((action) => (
                      <label
                        key={action}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={isPermissionChecked(resource, action)}
                          onCheckedChange={() =>
                            togglePermission(resource, action)
                          }
                        />
                        {action}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <FieldMaskEditor
              fieldPermissions={fieldPermissions}
              resources={resources}
              resourceFields={resourceFields}
              onToggle={toggleFieldPermission}
            />
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

function FieldMaskEditor({
  fieldPermissions,
  onToggle,
  resourceFields,
  resources
}: {
  fieldPermissions: { field: string; resource: string; visible: boolean }[];
  onToggle: (resource: string, field: string, visible: boolean) => void;
  resourceFields: Record<string, { field: string; label: string }[]>;
  resources: string[];
}) {
  const [selectedResource, setSelectedResource] = useState("user");

  const getVisibility = (field: string) => {
    const fp = fieldPermissions.find(
      (f) => f.resource === selectedResource && f.field === field
    );

    return fp?.visible ?? true;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">字段掩码</h3>
      <Select
        value={selectedResource}
        onValueChange={setSelectedResource}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {resources.map((r) => (
            <SelectItem
              key={r}
              value={r}
            >
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          {(resourceFields[selectedResource] ?? []).map(({ field, label }) => (
            <label
              key={field}
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                checked={getVisibility(field)}
                onCheckedChange={(checked) =>
                  onToggle(selectedResource, field, !!checked)
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
