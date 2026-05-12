# Project Guide

Skills:

- **[db-schema-definition](.claude/skills/db-schema-definition.md)** — DB 表定义：列规则、FK、枚举、时间戳、注册流程
- **[db-seed-data](.claude/skills/db-seed-data.md)** — 种子数据：固定 ID、数据/注入分离、覆盖策略、注入顺序
- **[shared-types-package](.claude/skills/shared-types-package.md)** — 共享类型：Zod schema 推导模式、pick/partial/extend、导出约定
- **[api-zod-schema](.claude/skills/api-zod-schema.md)** — API 端点规范：route/handler/index 三层结构、OpenAPI 路由、错误处理
- **[frontend-ui-patterns](.claude/skills/frontend-ui-patterns.md)** — 前端模式：组件抽留原则、Props 回调、卫语句渲染、Skeleton 加载

---

## 开发流程

```bash
# 完成功能后检查类型和代码质量
# 在根目录运行自动修复和检查
bun fix

## Tech Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Runtime    | Bun, Cloudflare Workers                                     |
| Database   | Drizzle ORM + D1 (SQLite)                                   |
| Backend    | Hono + @hono/zod-openapi                                    |
| Auth       | Better Auth                                                 |
| Frontend   | React 19 + TanStack Router + TanStack Query + TanStack Form |
| UI         | shadcn/ui (Radix + Tailwind v4)                             |
| Styling    | Tailwind v4 + tw-animate-css                                |
| Validation | Zod                                                         |
| Icons      | lucide-react                                                |
```
