# OSSInsight 重构计划

> 状态：草案（待实施）
> 目标：在保留现有 API 兼容性和表结构的前提下，对 OSSInsight 进行现代化重构。

---

## 一、背景与目标

### 现状问题

| 问题 | 当前情况 |
|------|---------|
| ETL 技术栈割裂 | Ruby on Rails（etl/）与 Node.js 并存，维护成本高 |
| 任务系统分散 | BullMQ、node-schedule、croner、toad-scheduler 各自为政 |
| ORM 不统一 | Prisma（cli、sync-github-data）、Kysely（cli）、Drizzle（部分）混用 |
| 前端老旧 | Docusaurus 2 + MUI，非现代 App Router 架构 |
| 无统一 CLI | 各包独立脚本，无法统一触发和管理后台任务 |
| 无 Admin UI | 管理员操作散落在各脚本和接口中 |

### 重构目标

1. **统一技术栈**：全面 TypeScript + Node.js，干掉 Ruby
2. **统一任务系统**：所有后台任务由一套分布式任务系统统一管理
3. **统一 ORM**：全面迁移至 Prisma 7，移除 Kysely/Drizzle
4. **统一数据库**：TiDB（保持不变）
5. **现代化前端**：Next.js 15 + shadcn/ui，拆分为 web/blog/docs/admin-ui
6. **提供统一 CLI**：`ossinsight` 命令触发任务，而非直接执行
7. **保留兼容性**：现有表结构和 API 端点保持不变（提供 legacy 过渡层）

---

## 二、新架构概览

```
ossinsight/                          ← 根目录（Turborepo + pnpm workspaces）
├── apps/
│   ├── web/                         ← 用户端（Next.js 15 + shadcn）
│   ├── blog/                        ← 博客（Next.js 15 + MDX）
│   ├── docs/                        ← 文档（Next.js 15，替代 Docusaurus）
│   └── admin-ui/                    ← 管理后台（Next.js 15 + shadcn）
│
├── services/
│   ├── api-server/                  ← REST API（Fastify 5，升级自现有）
│   ├── task-runner/                 ← 统一分布式任务执行系统（BullMQ）
│   └── etl/                         ← 数据管道（Node.js，替代 Ruby）
│
├── packages/
│   ├── database/                    ← Prisma 7 schema + 生成的 client
│   ├── ui/                          ← 共享 shadcn/ui 组件库
│   ├── config/                      ← 共享配置（eslint、tsconfig、vitest）
│   ├── query-engine/                ← SQL 模板引擎（从 api-server 抽出）
│   └── types/                       ← 共享 TypeScript 类型
│
├── tools/
│   └── cli/                         ← ossinsight CLI（Commander.js）
│
├── configs/                         ← 保持原样（queries/、pipelines/、materialized_views/）
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 三、技术栈选型

| 层级 | 当前 | 新版 |
|------|------|------|
| 包管理 | pnpm 9 | pnpm 9（保留）|
| Monorepo 构建 | 无 | Turborepo |
| 前端框架 | Docusaurus 2 / React 17 | Next.js 15（App Router）|
| UI 组件 | MUI 5 | shadcn/ui + Tailwind CSS v4 |
| 测试框架 | Jest（零散） | Vitest |
| ORM | Prisma + Kysely + Drizzle | **Prisma 7**（统一）|
| 数据库 | TiDB + SQLite + Redis | TiDB（主库）+ Redis（队列/缓存）|
| API 框架 | Fastify 4 | Fastify 5 |
| 任务系统 | BullMQ + node-schedule + croner + toad-scheduler | **BullMQ 5**（统一）|
| ETL | Ruby on Rails 6 | **Node.js / TypeScript**（重写）|
| SQL 模板 | Liquid（JS 实现）| LiquidJS（保留）|
| 监控 | Pino + Prometheus + Sentry | 保留，升级版本 |
| CLI | 无统一入口 | **ossinsight CLI**（Commander.js）|

---

## 四、详细设计

### 4.1 `packages/database` — 统一数据库层

**核心职责**：作为全项目唯一的 Prisma client 来源。

```
packages/database/
├── prisma/
│   ├── schema.prisma            ← 从现有 TiDB 表结构 introspect 生成
│   └── migrations/             ← 仅用于新增表（不修改现有表）
├── src/
│   ├── client.ts               ← 单例 PrismaClient，含连接池配置
│   ├── index.ts                ← 统一导出
│   └── types/                  ← 从 Prisma 导出的类型
└── package.json
```

**迁移策略**：
- 通过 `prisma db pull` 从现有 TiDB 生成初始 schema（`@@map` 保持原表名）
- **严格禁止**通过 Prisma 修改现有表结构（`@id`、`@map` 等仅做映射）
- 新功能所需新表通过 Prisma migrations 添加
- 替换现有代码中的 Kysely 和 Drizzle 查询

**Prisma 配置要点**：
```prisma
datasource db {
  provider = "mysql"       // TiDB 兼容 MySQL 协议
  url      = env("DATABASE_URL")
}

// 所有 model 使用 @@map 映射到现有表名
model GithubEvent {
  // ...
  @@map("github_events")
}
```

---

### 4.2 `services/task-runner` — 统一分布式任务系统

这是本次重构的核心新增服务，统一管理所有原本分散的任务。

#### 现有任务迁移映射

| 原系统 | 触发方式 | 新任务名 |
|--------|---------|---------|
| pipeline（28 个配置） | Cron | `pipeline:*` |
| prefetch（cron 驱动） | Cron | `prefetch:query` |
| GHArchive sync（Ruby ETL） | Cron | `etl:gharchive-sync` |
| GitHub events 同步 | Cron | `etl:github-events` |
| sync-github-data | Cron + On-demand | `etl:sync-github-data` |
| collection reload（CLI） | On-demand | `collection:reload` |
| AI Explorer 查询 | On-demand（队列） | `explorer:query` |

#### 架构设计

```
services/task-runner/
├── src/
│   ├── index.ts                ← 服务入口，启动 Worker + Scheduler
│   ├── registry/
│   │   ├── index.ts            ← TaskRegistry（任务注册表）
│   │   └── types.ts            ← TaskDefinition 类型
│   ├── workers/
│   │   ├── pipeline.worker.ts  ← Pipeline 任务 Worker
│   │   ├── etl.worker.ts       ← ETL 任务 Worker
│   │   ├── prefetch.worker.ts  ← Prefetch 任务 Worker
│   │   ├── collection.worker.ts← Collection 任务 Worker
│   │   └── explorer.worker.ts  ← AI Explorer 任务 Worker
│   ├── scheduler/
│   │   ├── index.ts            ← Cron 调度器（基于 BullMQ Scheduler）
│   │   └── schedules.ts        ← 从 configs/pipelines 读取 cron 配置
│   ├── client.ts               ← TaskClient（供 CLI 和 api-server 调用）
│   └── dashboard.ts            ← Bull-board UI（管理界面）
├── Dockerfile
└── package.json
```

#### 触发机制分类

```typescript
// 三种触发类型，统一抽象
type TriggerType =
  | { type: 'cron'; schedule: string }       // 定时触发（pipelines、prefetch）
  | { type: 'event'; event: string }          // 事件触发（GitHub webhooks）
  | { type: 'manual' }                        // 手动触发（CLI、API）

interface TaskDefinition {
  name: string
  trigger: TriggerType
  queue: 'high' | 'low' | 'default'         // 优先级队列
  concurrency: number
  retries: number
  handler: (job: Job<TaskPayload>) => Promise<void>
}
```

#### 队列结构

```
BullMQ Queues:
├── ossinsight:pipeline          ← 28 个 pipeline 任务（低并发，cron）
├── ossinsight:etl               ← ETL 数据导入（低并发，cron）
├── ossinsight:prefetch          ← 查询预热（中并发，cron + on-demand）
├── ossinsight:explorer-high     ← AI Explorer（高并发，on-demand）
├── ossinsight:explorer-low      ← AI Explorer 复杂查询（低并发，on-demand）
└── ossinsight:collection        ← Collection 操作（低并发，on-demand）
```

---

### 4.3 `services/etl` — Node.js ETL 服务（替代 Ruby）

将 Ruby on Rails ETL 完整移植为 TypeScript/Node.js。

```
services/etl/
├── src/
│   ├── index.ts                ← ETL Worker 入口（注册到 task-runner）
│   ├── sources/
│   │   ├── gharchive.ts        ← GitHub Archive 数据下载和解析
│   │   └── github-api.ts       ← GitHub API 数据抓取
│   ├── transforms/
│   │   ├── events.ts           ← github_events 数据清洗和规范化
│   │   ├── users.ts            ← 用户数据处理（geocoding）
│   │   └── repos.ts            ← 仓库数据处理
│   ├── loaders/
│   │   ├── batch-insert.ts     ← 批量写入 TiDB（使用 Prisma）
│   │   └── upsert.ts           ← 更新插入逻辑
│   ├── geocoding/
│   │   └── index.ts            ← 用户地理位置解析（替代 Ruby geocoder gem）
│   └── jobs/
│       ├── gharchive-sync.ts   ← GHArchive 同步任务
│       ├── github-events.ts    ← GitHub Events 同步任务
│       └── sync-github-data.ts ← GitHub 数据全量/增量同步
└── package.json
```

**Ruby → Node.js 功能映射**：

| Ruby 功能 | Node.js 实现 |
|-----------|-------------|
| `activerecord` 数据访问 | Prisma 7 |
| `retryable` gem | BullMQ 内置 retry + `p-retry` |
| `geocoder` gem | `node-geocoder` 或 Nominatim API |
| `yajl-ruby` JSON 解析 | Node.js 原生 JSON + `ndjson` 流解析 |
| `import_logs` 追踪 | 保留现有 `import_logs` 表 |
| Twitter 集成 | 评估是否仍需要（可选保留）|

---

### 4.4 `tools/cli` — 统一 ossinsight CLI

CLI 的核心设计原则：**只负责触发任务，不直接执行逻辑**。

```
tools/cli/
├── src/
│   ├── index.ts                ← CLI 入口（Commander.js）
│   ├── commands/
│   │   ├── task.ts             ← ossinsight task <run|list|status|logs>
│   │   ├── sync.ts             ← ossinsight sync <gharchive|github-data|events>
│   │   ├── pipeline.ts         ← ossinsight pipeline <run|list>
│   │   ├── etl.ts              ← ossinsight etl <run|status>
│   │   ├── collection.ts       ← ossinsight collection <reload|verify>
│   │   └── prefetch.ts         ← ossinsight prefetch <run>
│   └── client.ts               ← TaskClient（连接 task-runner 服务）
└── package.json
```

**命令设计**：

```bash
# 通用任务管理
ossinsight task run <task-name> [--payload '{}']
ossinsight task list [--status pending|active|completed|failed]
ossinsight task status <job-id>
ossinsight task logs <job-id>

# 数据同步（触发 ETL 任务）
ossinsight sync gharchive [--date 2024-01-01] [--hours 1]
ossinsight sync github-data [--repo owner/name]
ossinsight sync events [--since 1h]

# Pipeline 管理
ossinsight pipeline run <pipeline-name>
ossinsight pipeline list
ossinsight pipeline run-all [--dry-run]

# Collection 管理（现有功能迁移）
ossinsight collection reload [--id <collection-id>]
ossinsight collection verify

# 预热
ossinsight prefetch run [--query <query-name>]
```

---

### 4.5 `services/api-server` — API 服务升级

在保持完整向后兼容的前提下升级。

**变更内容**：
- Fastify 4 → Fastify 5
- Kysely → Prisma 7（使用 `packages/database`）
- OpenAI SDK 升级至最新版
- 将 job-server 功能合并（或通过 TaskClient 调用 task-runner）

**Legacy API 兼容策略**：
```typescript
// 保留所有现有路由，新增版本化路由
server.register(legacyRoutes, { prefix: '/' })      // 保持原 /q/, /gh/, /explorer/ 等
server.register(v2Routes, { prefix: '/v2' })         // 新版路由
```

---

### 4.6 前端应用（apps/）

#### `apps/web` — 用户端
```
apps/web/
├── app/
│   ├── (home)/                 ← 首页
│   ├── analyze/[owner]/[repo]/ ← 仓库分析页
│   ├── collections/            ← Collections 页
│   ├── explore/                ← AI Explorer 页
│   └── api/                    ← API routes（代理到 api-server）
├── components/                 ← 页面专用组件
├── lib/                        ← 工具函数
└── package.json
```

技术选型：Next.js 15、shadcn/ui、Tailwind CSS v4、ECharts、Vitest

#### `apps/admin-ui` — 管理后台
```
apps/admin-ui/
├── app/
│   ├── (dashboard)/
│   ├── tasks/                  ← 任务管理（接入 Bull-board 或自定义）
│   ├── collections/            ← Collection CRUD
│   ├── queries/                ← 查询配置管理
│   └── pipelines/              ← Pipeline 管理
└── package.json
```

#### `apps/docs` — 文档
- 替代 Docusaurus，使用 Next.js 15 + MDX
- 保留原有文档内容结构
- 集成 shadcn/ui 风格

#### `apps/blog` — 博客
- Next.js 15 + MDX
- 迁移现有 Docusaurus 博客内容

---

### 4.7 `packages/ui` — 共享组件库

基于 shadcn/ui 模式，作为所有 apps 的共享组件来源。

```
packages/ui/
├── src/
│   ├── components/             ← shadcn 组件（Button、Card、Table 等）
│   ├── charts/                 ← ECharts 封装组件
│   ├── layout/                 ← 布局组件（Sidebar、Header 等）
│   └── index.ts
└── package.json
```

---

## 五、数据流架构

```
GitHub Archive / GitHub API
         ↓
  [services/etl]  ←──── 由 task-runner 调度
         ↓ (批量写入)
      TiDB（保持现有表结构）
         ↑ (Prisma 7 查询)
  [services/api-server]
         ↑ (HTTP API)
  ┌──────┴───────┐
[apps/web]  [apps/admin-ui]
                  ↑
         [tools/cli]
                  ↑ (TaskClient)
         [services/task-runner]
              ↑ (BullMQ + Redis)
    ┌─────────┼──────────┐
 [pipeline] [etl] [prefetch] [explorer]
  workers   workers  workers   workers
```

---

## 六、实施分阶段计划

### Phase 1：基础设施（2 周）

**目标**：搭建新 monorepo 骨架，不破坏任何现有功能。

- [ ] 引入 Turborepo，配置 `turbo.json`
- [ ] 创建 `packages/config`（共享 ESLint、tsconfig、vitest 配置）
- [ ] 创建 `packages/database`
  - [ ] 通过 `prisma db pull` 生成初始 schema
  - [ ] 验证与现有 TiDB 的连接兼容性
  - [ ] 导出统一 PrismaClient
- [ ] 创建 `packages/types`（从现有 `@ossinsight/types` 迁移）
- [ ] 创建 `packages/ui`（初始化 shadcn/ui）

### Phase 2：统一任务系统（3 周）

**目标**：将分散的任务系统整合为统一的 task-runner。

- [ ] 创建 `services/task-runner`
  - [ ] 实现 TaskRegistry 和 TaskDefinition 类型
  - [ ] 迁移 BullMQ 队列配置（从 job-server）
  - [ ] 实现 BullMQ Scheduler（替代各处 node-schedule/croner）
  - [ ] 从 `configs/pipelines/` 读取 cron 配置自动注册
  - [ ] 集成 Bull-board 管理 UI
  - [ ] 实现 TaskClient（供外部调用）
- [ ] 迁移 `packages/pipeline` → task-runner workers
- [ ] 迁移 `packages/prefetch` → task-runner workers
- [ ] 迁移 job-server 的 explorer 队列 → task-runner

### Phase 3：CLI 工具（1 周）

**目标**：提供统一的 `ossinsight` CLI。

- [ ] 创建 `tools/cli`
  - [ ] 实现基础命令框架（Commander.js）
  - [ ] 接入 TaskClient，实现 `task` 命令组
  - [ ] 迁移现有 `collection reload` / `collection verify` 命令
  - [ ] 实现 `sync`、`pipeline`、`etl`、`prefetch` 命令组

### Phase 4：Node.js ETL（3 周）

**目标**：用 TypeScript 完整替代 Ruby ETL。

- [ ] 创建 `services/etl`
- [ ] 实现 GitHub Archive 下载和解析（替代 Ruby 版本）
- [ ] 实现 GitHub API 数据同步（替代 sync-github-data）
- [ ] 实现用户 geocoding（替代 Ruby geocoder）
- [ ] 实现 github_events 数据写入（使用 Prisma）
- [ ] 注册为 task-runner workers
- [ ] 并行运行验证（与 Ruby ETL 对比输出）
- [ ] 切换后下线 Ruby ETL（`etl/` 目录存档）

### Phase 5：API 服务升级（2 周）

**目标**：升级 api-server，迁移 ORM，保持兼容性。

- [ ] 升级 Fastify 4 → 5
- [ ] 将 Kysely 查询迁移为 Prisma 7（使用 `packages/database`）
- [ ] 更新 OpenAI SDK
- [ ] 将 job-server 任务投递改为通过 task-runner TaskClient
- [ ] 确认所有现有 API 端点正常工作（回归测试）
- [ ] 下线 `packages/job-server`（功能已迁移到 task-runner）

### Phase 6：前端应用（4 周）

**目标**：现代化前端，拆分为四个独立应用。

- [ ] 创建 `apps/web`（Next.js 15）
  - [ ] 迁移仓库分析页面
  - [ ] 迁移 Collections 页面
  - [ ] 迁移 AI Explorer 页面
  - [ ] ECharts 图表组件迁移
- [ ] 创建 `apps/admin-ui`（Next.js 15）
  - [ ] Task 管理界面
  - [ ] Collection CRUD
  - [ ] Pipeline 管理
- [ ] 创建 `apps/docs`（Next.js 15 + MDX）
  - [ ] 迁移 Docusaurus 文档内容
- [ ] 创建 `apps/blog`（Next.js 15 + MDX）
  - [ ] 迁移现有博客文章

### Phase 7：测试与质量（持续）

**目标**：建立统一的测试基础设施。

- [ ] 配置 Vitest（替代 Jest，统一 `packages/config/vitest`）
- [ ] 为 `packages/database` 编写集成测试
- [ ] 为 `services/task-runner` 编写单元测试
- [ ] 为 `services/etl` 编写单元测试（含 mock）
- [ ] 为 `services/api-server` 编写 API 回归测试
- [ ] 更新 GitHub Actions CI 流水线

---

## 七、关键约束与风险

### 不可变约束（必须遵守）

1. **现有表结构不变**：所有对 TiDB 的改动只能是新增，不能修改现有表
2. **API 向后兼容**：所有现有 API 端点必须保留，响应格式不变
3. **数据连续性**：ETL 切换期间不能有数据丢失或重复

### 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| Prisma 7 + TiDB 兼容性 | 早期验证，如有问题保留部分 Kysely 兼容层 |
| Ruby ETL 功能遗漏 | 并行运行两套系统，比对输出，完全一致后再下线 Ruby |
| task-runner 迁移影响生产 | 蓝绿部署，task-runner 先接管新任务，再逐步迁移现有任务 |
| 前端迁移工作量大 | 优先迁移核心页面，Docusaurus 继续运行直到 Next.js 版本就绪 |

---

## 八、保留不变的内容

以下内容在重构期间保持不变：

- `configs/` 目录：所有 query、pipeline、materialized_view 配置文件
- TiDB 数据库所有现有表结构
- 所有公开 API 端点（`/q/`、`/gh/`、`/explorer/`、`/collections/` 等）
- GitHub Actions 现有 CI 工作流（逐步升级）
- `etl/db/seed.sql`（数据种子）

---

## 九、新增依赖汇总

| 包 | 版本 | 用途 |
|----|------|------|
| turbo | latest | Monorepo 构建系统 |
| next | 15.x | 前端框架 |
| shadcn/ui | latest | UI 组件库 |
| tailwindcss | v4 | CSS 框架 |
| @prisma/client | 7.x | ORM |
| prisma | 7.x | ORM CLI |
| bullmq | 5.x | 分布式任务队列 |
| vitest | latest | 测试框架 |
| fastify | 5.x | API 框架（升级） |
| commander | latest | CLI 框架 |
| liquidjs | latest | SQL 模板（保留）|
| mdx | latest | 文档/博客内容 |

---

## 十、参考资料

- **ossinsight-next**（未完成的前序重构）：https://github.com/pingcap/ossinsight-next
  - 参考点：Widget 系统设计、schema-driven 配置、dual-environment 执行模式
  - 未采用点：过于复杂的 widget 规范体系（对于本次重构过度设计）
- **现有 configs/**：所有 pipeline、query、materialized_view 配置保持不动
- **现有 API 设计**：`/home/user/ossinsight/packages/api-server/` 路由结构

---

*计划制定日期：2026-02-22*
