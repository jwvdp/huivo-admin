---
name: frontend-ui-patterns
description: Use when creating or modifying React components in apps/web/src/ — component extraction, prop patterns, TanStack Form, TanStack Table, guard clause rendering, and skeleton loading
---

# Frontend UI Patterns

## Component Extraction

Extract when the reader must pause to understand logic — not based on line count:

| Extract                                            | Keep Inline                         |
| -------------------------------------------------- | ----------------------------------- |
| Render decisions (Badge variant, label lookup)     | ~10 lines of plain JSX              |
| Interaction logic (edit/delete, disabled state)    | Single onClick callback             |
| Cross-page patterns (action column, delete dialog) | Page-specific and simple            |
| Conceptually independent (complex form dialog)     | Extraction forces excessive jumping |

**Heuristic**: if extraction makes readers jump between files to understand the flow → don't extract. If inline code buries the data flow → extract.

## Type References

Types are imported from `@huivo-admin/types` — see **shared-types-package** skill for schema definitions:

```ts
import type { Role } from "@huivo-admin/types";
import { roleSchema } from "@huivo-admin/types";
```

Never redefine interface types inside `apps/web/`.

## Props: Callbacks Over Mutation Objects

Child components don't depend on `rpc` client or receive `useMutation` objects. Pass simple callbacks:

```ts
// ✅ Recommended
type Props = {
  onCreate: (payload: RoleFormPayload) => Promise<void>;
  onUpdate: (roleId: string, payload: RoleFormPayload) => Promise<void>;
};
```

Parent wraps with the mutation:

```tsx
onCreate={async (data) => {
  await createMutation.mutateAsync({ json: data });
}}
```

## Rendering: Guard Clauses

Three independent return paths — no ternary or `&&` nesting:

```tsx
// 1. Loading guard
if (isLoading) return <PageSkeleton />;

// 2. Empty / default guard
if (!data || data.length === 0) {
  return (
    <div className="space-y-6">
      <PageTitle ... />
      <EmptyState ... />
      <FormDialog ... />
    </div>
  );
}

// 3. Data path
return (
  <div className="space-y-6">
    <PageTitle ... />
    <DataTable ... />
    <FormDialog ... />
    <DeleteDialog ... />
  </div>
);
```

Each path is readable top-to-bottom without backtracking. Minor duplication of PageTitle/FormDialog between empty and data paths is acceptable.

## Loading: Skeleton

Loading state uses `@/components/ui/skeleton` matching the page layout:

```tsx
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="rounded-lg border">
        <div className="flex gap-4 border-b px-4 py-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (...))}
      </div>
    </div>
  );
}
```

## Form Submit: Guard Clause Branching

Use guard clauses in `onSubmit` to separate edit/create paths:

```tsx
onSubmit: async ({ value }) => {
  const payload = { ...value, fieldPermissions, permissions };
  if (isEdit) {
    await onUpdate(editingRole.id, payload);
    onSuccess();
    return;
  }
  await onCreate(payload);
  onSuccess();
};
```

## Forms: TanStack Form

所有表单统一使用 `@tanstack/react-form` + Zod 校验。shadcn 的 `form.tsx`（react-hook-form 封装）存在但项目中**不使用**。

### 基础模式

```tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const form = useForm({
  defaultValues: { name: "", description: "" },
  onSubmit: async ({ value }) => {
    // 通过 callback prop 调用 mutation
  },
  validators: {
    onSubmit: z.object({
      name: z.string().min(1, "名称不能为空").max(100)
    })
  }
});

// JSX — render-prop 模式
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

// 提交按钮 — 订阅 submitting 状态
<form.Subscribe selector={(s) => s.isSubmitting}>
  {(isSubmitting) => (
    <Button type="submit" disabled={isSubmitting}>提交</Button>
  )}
</form.Subscribe>
```

### 约定

- **字段布局**: 用 `@/components/ui/field` 的 `Field`、`FieldLabel`、`FieldError`。不用 shadcn `form.tsx` 的 `FormField`/`FormItem`/`FormMessage`
- **校验**: Zod schema 传入 `validators.onSubmit`
- **表单元素**: 包裹在原生 `<form onSubmit={e => { e.preventDefault(); form.handleSubmit(); }}>`
- **非标准字段**: 权限矩阵、字段掩码等不映射到单一表单字段的数据，用独立 `useState`，在 `onSubmit` 中合并到 payload

## Table: TanStack Table

所有表格统一使用 `@tanstack/react-table`，参考 [shadcn/ui data-table](https://ui.shadcn.com/docs/components/data-table) 模式。即使是当前较简单的表格，后续数据也会增长，直接上 data-table 避免后续重写。

与 `@/components/ui/table` 的关系：data-table 内部使用 shadcn 的 `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` 作为渲染层，上层由 `@tanstack/react-table` 管理列定义、排序、筛选、分页。

### 列定义模式

```tsx
import { createColumnHelper } from "@tanstack/react-table";
import type { Role } from "@huivo-admin/types";

const columnHelper = createColumnHelper<Role>();

const columns = [
  columnHelper.accessor("name", {
    header: "名称",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>
  }),
  columnHelper.accessor("description", {
    header: "描述",
    cell: (info) => (
      <span className="text-muted-foreground">{info.getValue() || "-"}</span>
    )
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <Button
        size="icon-xs"
        onClick={() => onEdit(row.original)}
      >
        <Pencil />
      </Button>
    )
  })
];
```

### 约定

- 用 `createColumnHelper` 获取类型安全的列定义
- Action 列用 `columnHelper.display`（不绑定数据字段）
- 排序/筛选/分页按需添加，data-table 模式下均为内置能力

## Related Skills

- **shared-types-package** — where shared Zod types are defined and exported
