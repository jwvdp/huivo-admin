# Project Guide

Skills:

- **[db-schema-and-seed](.claude/skills/db-schema-and-seed.md)** — DB schema 定义：表、列规则、FK、枚举、注册流程、种子数据

---

## 开发流程

```bash
# 完成功能后检查类型和代码质量
# 在根目录运行
bun check
# 自动修复
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
