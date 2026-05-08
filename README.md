# vite-hono-cloudflare-monorepo-template

Bun monorepo — Hono + Drizzle ORM + D1 后端，React + TanStack 前端，分别部署到 Cloudflare Workers。

## 目录

- [环境要求](#环境要求)
- [初始化](#初始化)
- [本地开发](#本地开发)
- [数据库](#数据库)
- [部署](#部署)
- [项目结构](#项目结构)

---

## 环境要求

| 工具         | 版本  | 用途                                           |
| ------------ | ----- | ---------------------------------------------- |
| **Bun**      | 1.3.x | 包管理 & 运行时                                |
| **Node**     | >= 18 | 兼容层（部分 wrangler 命令）                   |
| **Wrangler** | 4.x   | Cloudflare Workers CLI（root devDependencies） |

需准备：

- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费计划即可）
- Wrangler 认证：`bunx wrangler login`
- 这个必须登录，如果有问题可以试试把链接复制到 Safari

## 初始化

```bash
# 1. 克隆仓库
git clone <repo-url>
cd project

# 2. 安装依赖
bun install

# 3. 启动本地开发（Web + Worker 同时启动）
bun dev
```

首次启动后：

1. **初始化数据库** — 在 `apps/server` 目录执行：

```bash
bun db:reset         # 清空 → 重建 → 写种子数据
```

2. **访问本地站点** — 浏览器打开 `http://localhost:3000`

3. **注册用户** — 站点内完成注册（本地 D1 不限制）

> 注：`bun dev`（根目录）通过 Turbo 并行启动 Web（Vite :3000）和 Worker（wrangler dev :3100），且 Vite 自动将 `/api` 代理到 Worker。浏览器始终同源访问，Cookie 正常工作。

## 本地开发

### 启动

```bash
# 一键启动（Web + Worker + TypeScript 监听）
bun dev
```

### 创建新模块（Database → Backend → Frontend）

1. **DB schema** — `apps/server/src/db/schemas/` 添加表定义
2. **Seed** — `apps/server/src/db/seed/` 添加种子数据文件，在 `seed/index.ts` 注册
3. **API 四文件** — `apps/server/src/api/v1/<module>/` 下创建：
   - `schema.ts` — Zod 请求/响应
   - `route.ts` — OpenAPI 路由
   - `handler.ts` — 处理逻辑
   - `index.ts` — 注册到 app
4. **注册路由** — `apps/server/src/index.ts` 挂载模块
5. **前端** — `apps/web/src/routes/` 创建页面和子组件

### 常用命令

```bash
bun check        # 类型检查 + lint
bun fix          # 自动修复 lint
bun run type     # 仅类型检查
bun run lint     # 仅 lint
bun dev          # 启动开发服务器
```

## 数据库

### Schema 迭代

本地环境使用 `drizzle-kit push` 直接同步 schema 到本地 SQLite：

```bash
cd apps/server

# 修改 schema 文件后，推送变更到本地 D1
bun push
```

### 数据重置

```bash
# 完整重置：清空所有表 → 重建 schema → 写入种子数据
bun db:reset
```

清理原理：`drizzle.clean.config.ts` 指向空 schema 目录，`push --force` 时 Drizzle 检测当前数据库有表面 schema 为空，生成 DROP 语句清空所有表。

### 种子数据

每个模块在 `apps/server/src/db/seed/` 下有对应的 seed 文件，通过 `drizzle-orm/libsql` + `@libsql/client` 直连本地 SQLite 文件执行。

## 部署

### 1. 准备工作

#### 域名

确保你的域名 DNS 通过 Cloudflare 托管。你需要在 Cloudflare Dashboard 添加域名并等待 NS 记录生效。

#### 生产 D1 数据库

在 Cloudflare 上创建生产 D1 数据库：

```bash
cd apps/server
wrangler d1 create template-database
```

记下返回的 `database_id`，下一步配置时需要用到。

---

### 2. 修改配置

将以下文件中的占位信息替换为你自己的值。

#### apps/server/wrangler.jsonc

```jsonc
{
  "env": {
    "production": {
      "vars": {
        "API_BASE_URL": "https://你的域名", // 改为你的 Worker 域名
        "BETTER_AUTH_URL": "https://你的域名/api/v1/auth", // 同上
        "BETTER_AUTH_SECRET": "生成一个随机字符串" // openssl rand -hex 32
      },
      "d1_databases": [
        {
          "binding": "template_database",
          "database_name": "template-database",
          "database_id": "上一步创建的 database_id", // 改为刚创建的 ID
          "migrations_dir": "./src/db/.migrations"
        }
      ]
    }
  },
  "routes": [
    {
      "pattern": "你的域名/api/*", // 改为你的域名
      "zone_name": "你的主域名" // 例如 example.com
    }
  ]
}
```

#### apps/web/wrangler.jsonc

```jsonc
{
  "routes": [
    {
      "pattern": "你的域名/*", // 改为你的域名
      "zone_name": "你的主域名" // 例如 example.com
    }
  ]
}
```

#### apps/server/src/db/drizzle.config.ts

生产环境的 Drizzle push 通过 D1 HTTP API 直连远程数据库，需要三个环境变量：

```bash
# 在终端设置，或添加到 .env
export CLOUDFLARE_ACCOUNT_ID=你的 Cloudflare Account ID    # Dashboard 右侧可找到
export CLOUDFLARE_DATABASE_ID=上一步创建的 database_id
export CLOUDFLARE_TOKEN=你的 Cloudflare API Token           # 需 D1 写权限
```

> `drizzle.config.ts` 使用 `d1-http` driver 连接远程 D1，`drizzle.config.local.ts` 使用 `bun:sqlite` 直连本地文件，两者互不干扰。

#### apps/web/.env.production

```env
VITE_BETTER_AUTH_URL=https://你的域名/api/v1/auth
VITE_BASE_URL=https://你的域名
```

---

### 3. 执行部署

#### 推送生产数据库

首次部署或 schema 变更时，将表结构推送到远程 D1：

```bash
cd apps/server

# 先确认环境变量已设置
echo $CLOUDFLARE_ACCOUNT_ID $CLOUDFLARE_DATABASE_ID $CLOUDFLARE_TOKEN

# 推送 schema 到生产 D1（建议先 --dry-run 预览变更）
bunx drizzle-kit push --config src/db/drizzle.config.ts
```

#### 部署 Worker（@go/server）

```bash
cd apps/server
bun run deploy
# 等效于 wrangler deploy --env production
```

#### 部署前端（@go/web）

```bash
cd apps/web
bun run deploy
# 等效于 vite build && wrangler deploy
```

前端以 Worker/Pages 形式部署，`not_found_handling: "single-page-application"` 确保所有路径回退到 `index.html`。

#### 从根目录一键部署

```bash
bun run build    # 构建前端 + 类型检查
bun run deploy   # 部署 server + web
```

## 项目结构

```
├── apps/
│   ├── server/                    # @go/server — Cloudflare Worker
│   │   ├── src/
│   │   │   ├── index.ts           # Hono app 入口，导出 AppType
│   │   │   ├── client.ts          # hc<AppType> 工厂
│   │   │   ├── api/
│   │   │   │   ├── common.ts      # OpenAPI 辅助类型
│   │   │   │   └── v1/<module>/   # schema.ts, route.ts, handler.ts, index.ts
│   │   │   ├── lib/               # better-auth, require-auth, drizzle
│   │   │   └── db/
│   │   │       ├── schemas/       # Drizzle ORM 表定义
│   │   │       ├── seed/          # 种子数据（每模块一文件 + index.ts 入口）
│   │   │       ├── .migrations/   # D1 迁移文件
│   │   │       ├── .empty-schema/ # db:clean 用空 schema
│   │   │       ├── drizzle.config.local.ts
│   │   │       └── drizzle.clean.config.ts
│   │   └── wrangler.jsonc
│   └── web/                       # @go/web — React 前端
│       ├── src/
│       │   ├── routes/            # TanStack Router 文件路由
│       │   ├── lib/               # hono-rpc-client, tanstack-rpc, session
│       │   └── components/        # 共享 UI 组件（shadcn/ui）
│       ├── vite.config.ts
│       ├── .env.development
│       ├── .env.production
│       └── wrangler.jsonc
├── CLAUDE.md                      # 项目指南 + 技能索引
├── .claude/skills/                # 编码技能（server-module, frontend）
├── turbo.json
└── package.json
```
