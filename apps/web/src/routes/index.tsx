import { SiGithub } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16 md:px-8 md:py-20">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <p>vite-hono-cloudflare-template</p>
          <a
            href="https://github.com/YiHeCN/vite-hono-cloudflare-template"
            target="_blank"
          >
            <SiGithub className="inline size-4" />
          </a>
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          技术架构说明
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          本页概括仓库的分层、运行时与数据流。详细细节见 README.md。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          站内入口
        </h2>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            className="text-primary underline-offset-4 hover:underline"
            to="/auth/login"
          >
            登录
          </Link>
          <Link
            className="text-primary underline-offset-4 hover:underline"
            to="/auth/register"
          >
            注册
          </Link>
          <a
            className="text-primary underline-offset-4 hover:underline"
            href="/api/scalar"
            rel="noreferrer"
            target="_blank"
          >
            API 文档（Scalar）
          </a>
        </nav>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">概览</h2>
        <p className="leading-relaxed text-muted-foreground">
          Bun 管理的 monorepo，Turbo 编排任务；前后端分别可部署到
          Cloudflare（Worker + Pages/Worker 站点）。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="text-foreground">@go/web</span>：Vite + React
            19，TanStack Router / Query / Form，Tailwind CSS v4
          </li>
          <li>
            <span className="text-foreground">@go/server</span>：Cloudflare
            Worker 上的 Hono（OpenAPI），Better Auth，Drizzle ORM + D1；
            按模块拆分为 schema / route / handler / index，每模块含 seed 文件
          </li>
          <li>
            类型安全 API 调用：服务端导出{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              AppType
            </code>
            ，Web 通过{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              hc&lt;AppType&gt;
            </code>{" "}
            与自定义{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              createHonoQueryClient
            </code>{" "}
            对接 TanStack Query
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          工具链与质量
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          根目录脚本与约束。
        </p>
        <dl className="grid gap-3 text-sm">
          {[
            ["包管理", "Bun workspaces（apps/*）"],
            ["任务编排", "Turbo：dev、tsc、build、deploy、type"],
            [
              "代码质量",
              "Ultracite（Biome）lint + format；`bun check` 一键执行 type + lint"
            ],
            [
              "TypeScript",
              "根 tsconfig 开启 strict 与 verbatimModuleSyntax；子包各自补强"
            ]
          ].map(([term, desc]) => (
            <div
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
              key={term}
            >
              <dt className="shrink-0 font-medium text-foreground">{term}</dt>
              <dd className="text-muted-foreground">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          前端 @go/web
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          应用壳、路由与开发服务器。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            文件路由由{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              @tanstack/router-plugin
            </code>{" "}
            生成；受保护区在{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              routes/_protected
            </code>
            ，beforeLoad 中校验 Better Auth 会话
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              @cloudflare/vite-plugin
            </code>{" "}
            与生产构建路径对齐 Cloudflare；本地默认端口 3000
          </li>
          <li>
            Vite 将{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api
            </code>{" "}
            代理到 Worker 开发端口（默认 3100），浏览器始终同源访问 Web
            origin，便于 Cookie 与鉴权
          </li>
          <li>
            RPC 基址由{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              VITE_BASE_URL
            </code>{" "}
            提供：开发环境指向本站（经代理转发 API），生产指向对外 API 域名
          </li>
          <li>
            组件组织：页面组件在{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              routes/&lt;path&gt;.tsx
            </code>
            ，专用于组件在{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              routes/&lt;path&gt;/components/
            </code>
            ；表单、骨架屏、表格均拆为独立文件
          </li>
          <li>
            Session 缓存：getSession() 通过 TanStack Query 缓存 5 分钟，
            避免每次导航重复请求；登录成功直接写入 query cache 消除刷新延迟
          </li>
        </ul>
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          {`apps/web/
  src/routes/          # TanStack Router 文件路由
    _protected/          # 受保护布局（beforeLoad 验会话）
      <page>/            # 页面组件
      components/        # 页面专用组件（表单、骨架屏、表格）
    auth/                # 登录/注册（beforeLoad 跳转已登录用户）
  src/lib/
    hono-rpc-client.ts   # hc + QueryClient
    tanstack-rpc.ts      # Hono 客户端 → Query/Mutation 助手
    session.ts           # getSession() 缓存 5 分钟
  vite.config.ts       # proxy /api → Worker`}
        </pre>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          后端 @go/server
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Worker 入口与 API 分层。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            入口{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              OpenAPIHono&lt;AppBindings&gt;
            </code>
            ：绑定 Cloudflare{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              Env
            </code>
            ，变量中存放当前用户 id（鉴权通过后）
          </li>
          <li>
            Better Auth 挂载在{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api/v1/auth/*
            </code>
            ，适配器为 Drizzle + SQLite（D1）
          </li>
          <li>
            业务 API 挂在{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api/v1/...
            </code>
            ；示例资源{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              post
            </code>{" "}
            使用 route / handler / index 拆分，子应用级{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              requireAuth
            </code>
            ；新模块遵循 Database → Backend → Frontend 的开发顺序
          </li>
          <li>
            OpenAPI 文档与 Scalar UI：
            <code className="mx-1 rounded bg-muted px-1 text-xs text-foreground">
              /api/doc
            </code>
            、
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api/scalar
            </code>
            （本地可通过本站{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api/...
            </code>{" "}
            代理访问）
          </li>
        </ul>
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          {`apps/server/src/
  index.ts             # 组装 app，导出 AppType
  client.ts            # hc<AppType> 工厂（供 @go/web 依赖）
  api/common.ts        # OpenAPI 辅助类型与 AppBindings
  api/v1/<resource>/   # schema.ts, route.ts, handler.ts, index.ts
  lib/
    better-auth.ts
    require-auth.ts
    drizzle.ts
  db/
    schemas/             # Drizzle ORM 表定义
    seed/                # 每模块一个 seed 文件 + index.ts 入口
    .empty-schema/       # db:clean 用（清空所有表）
    drizzle.config.local.ts
    drizzle.clean.config.ts`}
        </pre>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          数据与迁移
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          D1 与 Drizzle 的职责划分。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Wrangler 为各环境绑定{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              template_database
            </code>
            ，迁移目录指向{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              src/db/.migrations
            </code>
          </li>
          <li>
            本地 schema 迭代可使用 server 包内{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              bun run push
            </code>{" "}
            （drizzle-kit + 本地配置），与云端迁移策略按需区分
          </li>
          <li>
            本地数据重置：{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              bun db:reset
            </code>{" "}
            = 清空所有表(empty-schema push) + 重建 schema + 写入 seed 数据；
            每个模块提供独立的{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              seed/&lt;module&gt;.ts
            </code>
            ，按模块管理测试数据
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          开发流程
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          本地启动与模块开发的标准流程。
        </p>
        <dl className="grid gap-3 text-sm">
          {[
            [
              "本地开发",
              "bun dev（根目录）同时启动 Web（:3000）和 Worker（:3100），Vite 自动代理 /api → Worker"
            ],
            [
              "新模块开发",
              "DB schema → seed → API schema/route/handler/index → 前端页面，始终遵循 Database → Backend → Frontend 顺序"
            ],
            [
              "数据库",
              "bun push 推送 schema 到本地 D1；bun db:reset 清空数据并重建；bun db:seed 写入测试种子数据"
            ],
            [
              "质量检查",
              "bun check 执行 type + lint，确保代码类型安全且符合规范"
            ]
          ].map(([term, desc]) => (
            <div
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
              key={term}
            >
              <dt className="shrink-0 font-medium text-foreground">{term}</dt>
              <dd className="text-muted-foreground">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          项目文档
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          仓库根目录 CLAUDE.md + skills 体系，编码时自动加载。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              CLAUDE.md
            </code>{" "}
            — Tech Stack、开发命令、技能索引
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              .claude/skills/server-module.md
            </code>{" "}
            — DB schema、seeding、API 四文件结构、通用模式
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              .claude/skills/frontend.md
            </code>{" "}
            — RPC 查询/变更、PageTitle、Loading/Empty、表单、表格、组件组织、
            Auth & Session、面包屑
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          初始化
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          从仓库到本地跑通。
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              git clone {"&&"} bun install
            </code>
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              bun dev
            </code>{" "}
            （根目录）启动 Web（:3000）和 Worker（:3100）
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              cd apps/server {"&&"} bun db:reset
            </code>{" "}
            初始化本地 D1 并写入种子数据
          </li>
          <li>
            浏览器打开{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              http://localhost:3000
            </code>{" "}
            注册用户后可使用 demo 功能
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">部署</h2>
        <p className="leading-relaxed text-muted-foreground">
          准备域名和 D1 → 修改配置 → 执行脚本。
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong>准备工作</strong> — 域名 DNS 托管到 Cloudflare；
            <code className="mx-1 rounded bg-muted px-1 text-xs text-foreground">
              wrangler d1 create template-database
            </code>
            创建生产 D1
          </li>
          <li>
            <strong>修改配置</strong> — 更新{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              wrangler.jsonc
            </code>
            （域名、路由、D1 ID、环境变量）、
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              drizzle.config.ts
            </code>
            （Cloudflare 凭证）、
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              .env.production
            </code>
            （前端域名）
          </li>
          <li>
            <strong>推送数据库</strong> —{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              bunx drizzle-kit push --config src/db/drizzle.config.ts
            </code>
          </li>
          <li>
            <strong>部署</strong> —{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              bun run build {"&&"} bun run deploy
            </code>
            （根目录）依次构建前端并部署 server + web
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          请求路径（本地）
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          浏览器与两个进程之间的关系。
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            用户访问{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              http://localhost:3000
            </code>
          </li>
          <li>
            页面内的 RPC 请求打到{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              VITE_BASE_URL
            </code>{" "}
            下的{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api/...
            </code>
          </li>
          <li>
            Vite 将{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              /api
            </code>{" "}
            转发到{" "}
            <code className="rounded bg-muted px-1 text-xs text-foreground">
              Wrangler dev
            </code>{" "}
            （默认 3100），由 Worker 处理鉴权与数据库
          </li>
        </ol>
      </section>
    </div>
  );
}
