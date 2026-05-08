# Project Guide

Skills:

- **[server-module](.claude/skills/server-module.md)** — 服务端模块开发：DB schema、seeding、API 四文件结构、注册、通用模式
- **[frontend](.claude/skills/frontend.md)** — 前端开发：RPC 查询/变更、PageTitle、表单、表格、组件组织、Auth & Session、面包屑

---

## 开发流程

```bash
# 完成功能后检查类型和代码质量
bun check

# 或分开运行
bun run type   # TypeScript 类型检查
bun run lint   # 代码检查
```

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
