---
name: frontend
description: "Frontend RPC patterns, UI components, auth session, and breadcrumbs"
trigger: "when working on frontend code in apps/web/"
---

## RPC Client

位置: `apps/web/src/lib/hono-rpc-client.ts`.

```ts
import { hcWithType } from "@huivo-admin/server/client";
import { createHonoQueryClient } from "./tanstack-rpc";

export const rpc = createHonoQueryClient(
  hcWithType(import.meta.env.VITE_BASE_URL),
  queryClient
);
```

rpc 对象的路径与服务器 API 路径一一对应:

- `rpc.api.v1.post.$get.useQuery()` → `GET /api/v1/post`
- `rpc.api.v1.post[":postId"].$get.useQuery({ param: { postId } })` → `GET /api/v1/post/:postId`
- `rpc.api.v1.post.$post.useMutation()` → `POST /api/v1/post`
- `rpc.api.v1.post[":postId"].$patch.useMutation()` → `PATCH /api/v1/post/:postId`
- `rpc.api.v1.post[":postId"].$delete.useMutation()` → `DELETE /api/v1/post/:postId`

## RPC 查询和变更

### useQuery — 数据获取

```tsx
// GET 列表
const { data: posts = [], isPending } = rpc.api.v1.post.$get.useQuery();

// GET 单条（带路径参数）
const { data: postItem, isPending } = rpc.api.v1.post[":postId"].$get.useQuery({
  param: { postId }
});
```

### useMutation — 数据变更

`invalidate` 参数用于成功后自动刷新指定查询。可以传 queryKey 数组或函数:

```tsx
// 创建 — 使用函数动态生成 invalidation key
const createMutation = rpc.api.v1.post.$post.useMutation({
  invalidate: () => [rpc.api.v1.post.$get.getQueryKey()],
  onError: (error) => toast.error(error.message),
  onSuccess: (data) => {
    toast.success("Created");
  }
});

// 更新 — 显式 invalidation key
const updateMutation = rpc.api.v1.post[":postId"].$patch.useMutation({
  invalidate: [
    rpc.api.v1.post[":postId"].$get.getQueryKey({ param: { postId } })
  ]
});

// 删除 — 从列表中移除后刷新列表
const deleteMutation = rpc.api.v1.post[":postId"].$delete.useMutation({
  invalidate: [rpc.api.v1.post.$get.getQueryKey()]
});
```

调用 mutation:

```tsx
createMutation.mutate({ json: value });
updateMutation.mutate({ json: value, param: { postId } });
deleteMutation.mutate({ param: { postId } });
```

## PageTitle

所有数据展示类页面必须使用 `PageTitle` 组件统一页面标题区。

位置: `apps/web/src/routes/_protected/components/page-title.tsx`

```tsx
import { PageTitle } from "@/routes/_protected/components/page-title";

<PageTitle
  title="Posts"
  subtitle="Manage your blog posts"
>
  <Button asChild>
    <Link to="/post/new">
      <PlusIcon />
      New Post
    </Link>
  </Button>
</PageTitle>;
```

- `title` — 主标题 (string | ReactNode)
- `subtitle` — 副标题 (string | ReactNode)
- `children` — 操作按钮，桌面端显示在标题右侧，移动端固定在底部

页面内的小节标题使用 `SectionWithTitle`（同文件导出）:

```tsx
import { SectionWithTitle } from "@/routes/_protected/components/page-title";

<SectionWithTitle
  title="Details"
  action={<Button>Edit</Button>}
>
  {/* section content */}
</SectionWithTitle>;
```

表单类页面（新建/编辑）不需要 PageTitle，使用 Card 内的标题即可。

## Loading & Empty States

每个数据获取必须有三种状态处理:

```tsx
const { data: posts = [], isPending } = rpc.api.v1.post.$get.useQuery();

// 1. Loading — 根据数据的长相写的模拟 Skeleton
if (isPending) {
  return <SkeletonYouWritten />;
}

// 2. Empty state
if (posts.length === 0) {
  return <div className="text-center text-muted-foreground">No posts.</div>;
}

// 3. Normal render
return <div>{posts.map(...)}</div>;
```

对单条数据查询:

```tsx
if (isPending) return <SkeletonYouWritten />;
if (!postItem) return <div>Not found.</div>;
return <div>{postItem.title}</div>;
```

## Forms

永远使用 `@tanstack/react-form`:

```tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1)
});

function MyForm() {
  const form = useForm({
    defaultValues: { title: "" },
    onSubmit: ({ value }) => {
      mutation.mutate({ json: value });
    },
    validators: { onSubmit: schema }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="title">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input
              id={field.name}
              onChange={(e) => field.handleChange(e.target.value)}
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      <Button type="submit">Save</Button>
    </form>
  );
}
```

表单提交按钮使用 `type="submit"`，不要额外加 `onClick`，否则会双重提交。

## Tables

使用 `<Table>` 组件 + 内联 map，如果想要更强大的排序，筛选，分页，批量操作，则按照 shadcn/ui 的方法使用 TanStack Table 库:

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.length === 0 && (
      <TableRow>
        <TableCell
          colSpan={2}
          className="text-center"
        >
          No items.
        </TableCell>
      </TableRow>
    )}
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.title}</TableCell>
        <TableCell>{/* action buttons */}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Component Organization

- 页面组件在 `apps/web/src/routes/<route-path>.tsx`
- 该页面专用的子组件放在 `apps/web/src/routes/<route-path>/components/` 目录
- 注意: `routes` 目录已配置为不匹配 `components/**` 作为路由路径
- 能拆分尽量拆分，保持每个文件职责单一
- 比如表单，骨架屏，表格，都应该放在该页面专用的子组件中，不要放在该页面组件中

## Auth & Session

- 使用 Better Auth + TanStack Query 缓存 session
- `getSession()` (from `@/lib/session`) 自动缓存 5 分钟
- 受保护路由的 `beforeLoad` 中调用 `getSession()` 做守卫
- 登录页也有 `beforeLoad` 自动跳转已登录用户到 `/dashboard`
- 登录成功后从响应数据直接写入 query cache：`queryClient.setQueryData(sessionQueryKey, { data, error: null })`

## 面包屑

位置: `SiteHeader` 组件。从 URL 路径自动生成:

- 静态路由显示 labelMap 中的名称 (post → Posts, new → New)
- 动态路由 (`$postId`) 显示为 "Details"
- 中间层级可点击返回

添加新路由时如需自定义面包屑名称，更新 `labelMap`。
