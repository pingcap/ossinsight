# OSSInsight 重构计划 v2

> 状态：草案（待实施）
> 目标：在保留现有 API 兼容性和表结构的前提下，对 OSSInsight 进行现代化重构。

---

## 一、架构概览

### 新目录结构

```
ossinsight/
├── apps/
│   ├── web/                     # 用户端（Next.js 15 + shadcn）
│   │   └── app/
│   │       ├── api/
│   │       │   ├── q/[...query]/    # Route Handler：通用查询执行
│   │       │   └── explorer/        # Route Handler：AI Explorer
│   │       ├── analyze/[owner]/[repo]/
│   │       ├── collections/
│   │       └── explore/
│   ├── blog/                    # 博客（Next.js 15 + MDX）
│   ├── docs/                    # 文档（Next.js 15 + MDX，替代 Docusaurus）
│   └── admin-ui/                # 管理后台（Next.js 15 + shadcn）
│       └── app/
│           ├── api/             # Admin Route Handlers
│           ├── tasks/           # 任务管理界面
│           ├── collections/     # Collection CRUD
│           └── pipelines/       # Pipeline 管理
│
├── packages/
│   ├── core/                    # 核心层（Prisma schema + 查询引擎 + 共享类型）
│   ├── ui/                      # 共享组件库（shadcn + ECharts + Widget 渲染器）
│   ├── task-runner/             # 统一分布式任务系统（BullMQ 5）
│   ├── etl/                     # 数据管道（Node.js，替代 Ruby ETL）
│   └── cli/                     # ossinsight CLI（Commander.js）
│
├── widgets/                     # Widget 实现（参考 ossinsight-next 结构）
│   ├── analyze/                 # 仓库/用户分析 Widget
│   ├── basic/                   # 基础图表 Widget
│   ├── collection/              # Collection Widget
│   └── compose/                 # 组合 Widget
│
├── schemas/                     # JSON Schema 定义（规范来源）
│   ├── query/v1/                # 查询配置 schema
│   └── widget/v1/               # Widget schema（参考 ossinsight-next）
│
├── configs/                     # 保持原样（只读，不破坏）
│   ├── queries/                 # 查询配置（params.json + template.sql）
│   ├── pipelines/               # Pipeline 配置（config.json + process.sql）
│   └── public_api/              # 公开 API 端点配置
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 技术栈选型

| 层级 | 当前 | 新版 |
|------|------|------|
| Monorepo 构建 | 无 | **Turborepo** |
| 前端框架 | Docusaurus 2 + React 17 | **Next.js 15**（App Router）|
| API 层 | 独立 Fastify 服务 | **Next.js Route Handlers**（内嵌于 apps/web）|
| UI 组件 | MUI 5 | **shadcn/ui** + Tailwind CSS v4 |
| 测试 | Jest（零散） | **Vitest** |
| ORM | Prisma + Kysely + Drizzle | **Prisma 7**（统一，schema 在 packages/core）|
| 数据库 | TiDB + SQLite + Redis | TiDB（主库）+ Redis（队列/缓存）|
| 任务系统 | BullMQ + toad-scheduler + croner + 本地内存队列 | **BullMQ 5**（统一）|
| ETL | Ruby on Rails 6 | **Node.js / TypeScript**（packages/etl）|
| SQL 模板 | LiquidJS | **LiquidJS**（保留）|
| CLI | 无统一入口 | **ossinsight CLI**（packages/cli）|
| Widget 系统 | 无 | **声明式 Widget**（参考 ossinsight-next）|

---

## 二、BullMQ 并发控制设计

### BullMQ 支持的并发控制维度

BullMQ 开源版本支持以下维度的并发控制：

| 维度 | 机制 | 说明 |
|------|------|------|
| **每队列并发数** | `new Worker(name, fn, { concurrency: N })` | 单个 Worker 同时处理的 Job 数 |
| **速率限制** | `new Worker(name, fn, { limiter: { max, duration } })` | 时间窗口内最多处理 N 个 Job |
| **防重入** | `preventOverrun: true`（Job 选项）| 同一 Job 不并发执行 |
| **优先级队列** | `job.opts.priority`（1-2097152，越小越高）| 同队列内按优先级调度 |
| **多 Worker 横向扩展** | 多进程/多实例同消费一个队列 | 提升整体吞吐量 |

**对不同任务类型的并发控制最佳实践：使用独立队列**。每个队列对应独立的 Worker 实例，独立配置 `concurrency`、`limiter` 等选项。这是 BullMQ 的推荐模式，也是现有 explorer 队列（高/低并发分队列）的做法。

> **BullMQ Pro** 的 Job Groups 功能可以在单队列内按 group 做并发限制（如每个用户 ID 最多并发 1 个 Job），但属于付费功能。开源版本的替代方案是以 `jobId` 实现幂等性 + 分队列控制并发。

---

## 三、当前任务类型全览与迁移方案

现有 6 类任务，分散在 4 套不同机制中，全部迁移至 `packages/task-runner` 统一管理。

### 3.1 Explorer AI 查询任务

**现状**：
- 框架：BullMQ（已有）
- 队列：`explorer_high_concurrent_queue`、`explorer_low_concurrent_queue`
- 触发：事件驱动（用户提交 AI 问题）
- 并发：环境变量 `EXPLORER_HIGH_QUEUE_CONCURRENT`、`EXPLORER_LOW_QUEUE_CONCURRENT` 控制
- 逻辑：调用 `ExplorerService.resolveQuestion()`，执行 AI 生成 SQL，更新 Question 状态

**问题**：Worker 注册在独立的 job-server 服务中，与 api-server 部署耦合

**迁移后**：

```
队列：ossinsight:explorer-high    concurrency: $EXPLORER_HIGH_QUEUE_CONCURRENT（默认 5）
     ossinsight:explorer-low     concurrency: $EXPLORER_LOW_QUEUE_CONCURRENT（默认 2）
触发：apps/web Route Handler 将 Job 投入队列（通过 packages/core TaskClient）
Worker：packages/task-runner/src/workers/explorer.worker.ts
```

---

### 3.2 Pipeline 数据聚合任务

**现状**：
- 框架：`@fastify/schedule` + `toad-scheduler`（CronJob）
- 配置：`configs/pipelines/*/config.json`，22+ 个 pipeline
- 触发：Cron（秒级 cron 表达式，UTC 时区）
- 逻辑：读取 `process.sql`，将 `{from}`、`{to}` 替换为时间范围，执行聚合 SQL

**Pipeline 配置结构（当前）**：

```json
{
  "name": "calc_events_total_minutely",
  "cron": "0 * * * * *",
  "incremental": { "timeRange": "last_hour" }
}
```

**时间范围预设（7 种）**：`last_month`、`past_month`、`yesterday`、`last_day`、`last_hour`、`past_24_hours`、`past_hour`

**主要 Pipeline 列表**：

| Pipeline 名称 | Cron | 时间范围 |
|--------------|------|---------|
| calc_events_total_minutely | 每分钟 | last_hour |
| calc_events_total_hourly | 每小时 | last_day |
| sync_repo_pull_requests | 每天 00:40 | last_day |
| calc_collection_repo_monthly_summary | 每天 04:00 | last_month |
| sync_org_repo_daily_engagements | 每天 00:20 | last_day |
| sync_org_repo_countries/organizations (多角色) | 每天 01:00–01:30 | last_day |
| （共 22+ 个） | | |

**迁移后**：

```
队列：ossinsight:pipeline             concurrency: 2
触发：BullMQ Scheduler 从 configs/pipelines/ 自动读取 cron 注册
选项：preventOverrun: true（上一次未完成时不重复执行）
Worker：packages/task-runner/src/workers/pipeline.worker.ts
```

---

### 3.3 Prefetch 查询预热任务

**现状**：
- 框架：本地内存异步队列（**非** BullMQ），自实现的 PrefetchQueue
- 4 种队列，各有独立并发数和超时：

| 队列名 | 并发数 | 超时 | 用途 |
|--------|--------|------|------|
| MAIN | 2 | 240s | 普通查询预热 |
| CONCURRENT | 3 | 60s | 多参数组合查询 |
| REALTIME | 2 | 10s | 实时数据查询（高频）|
| EVENTS_TOTAL | 2 | 180s | events 总量查询 |

- 触发：自定义 cron 标识（`@once`、`@hourly`、`@daily`、`@collection-daily`、`@collection-monthly`、`@weekly`、`@monthly`）以及支持按参数值动态选择 cron 的 `ConditionalRefreshCrons`

**ConditionalRefreshCrons 示例**（按 `period` 参数选 cron）：

```json
{
  "refreshCron": {
    "param": "period",
    "on": {
      "past_24_hours": "@daily",
      "past_week":     "@daily",
      "past_month":    "@daily",
      "past_3_months": "@daily"
    }
  }
}
```

**问题**：基于内存队列，重启后 Job 丢失；无持久化、无监控、无重试

**迁移后**：

```
队列：ossinsight:prefetch-main          concurrency: 2, timeout: 240s
     ossinsight:prefetch-concurrent     concurrency: 3, timeout: 60s
     ossinsight:prefetch-realtime       concurrency: 2, timeout: 10s
     ossinsight:prefetch-events-total   concurrency: 2, timeout: 180s
触发：BullMQ Scheduler 扫描 configs/queries/ 中的 refreshCron 自动注册
      ConditionalRefreshCrons：对每个枚举值各注册一个 Scheduler Job
Worker：packages/task-runner/src/workers/prefetch.worker.ts
优势：持久化（Redis）、支持重试、可监控（Bull-board）
```

---

### 3.4 ETL 数据导入任务（Ruby → Node.js）

**现状**：
- 框架：Ruby on Rails + ActiveJob
- Jobs：
  - `FetchEvent`：GitHub Events API 增量抓取
  - `HnFetchItem` / `HnFetchUser`：HackerNews 数据抓取
  - `SoFetchQuestion` / `SoFetchAnswer` / `SoFetchComment`：StackOverflow 数据抓取
  - `HnRealtime` / `SoRealtime`：实时同步循环
- 触发：外部调度

**迁移后（packages/etl + task-runner）**：

```
队列：ossinsight:etl-github            concurrency: 1（顺序写入，保证数据完整性）
     ossinsight:etl-gharchive         concurrency: 1（GH Archive 批量导入）
     ossinsight:etl-hn                concurrency: 2（HackerNews，可选保留）
     ossinsight:etl-so                concurrency: 2（StackOverflow，可选保留）
触发：Cron（每小时/每天）或手动（通过 CLI）
Worker：packages/etl/ 实现 handler，由 packages/task-runner 加载
```

---

### 3.5 GitHub 数据同步任务

**现状**：
- 框架：CLI 命令（`packages/sync-github-data`），手动触发
- 命令集：
  - **Repos**：`pull`、`sync-in-batch`、`sync-in-concurrent`、`mark-deleted`
  - **Users**：`sync-in-batch`、`load-orgs`、`mark-bots`、`format-address`、`format-orgs`
- ORM：Prisma + Kysely（混用）

**迁移后**：

```
队列：ossinsight:sync-github           concurrency: 3
触发：手动（ossinsight CLI）或 Cron（每日/每周）
Worker：packages/etl/src/workers/github-sync.worker.ts
限速：limiter: { max: 5000, duration: 3600000 }（遵守 GitHub API 5000 req/h 限制）
```

---

### 3.6 Collection 操作任务

**现状**：手动 CLI 命令（`collection reload`、`collection verify`）

**迁移后**：

```
队列：ossinsight:collection            concurrency: 2
触发：手动（CLI / Admin UI）
Worker：packages/task-runner/src/workers/collection.worker.ts
```

---

### 完整 BullMQ 队列配置总览

```
队列名                           并发  触发方式         备注
──────────────────────────────────────────────────────────────
ossinsight:explorer-high         5*   事件（用户请求）   -
ossinsight:explorer-low          2*   事件（用户请求）   -
ossinsight:pipeline              2    Cron             preventOverrun
ossinsight:prefetch-main         2    Cron             timeout: 240s
ossinsight:prefetch-concurrent   3    Cron             timeout: 60s
ossinsight:prefetch-realtime     2    Cron             timeout: 10s
ossinsight:prefetch-events-total 2    Cron             timeout: 180s
ossinsight:etl-github            1    Cron + Manual    -
ossinsight:etl-gharchive         1    Cron             -
ossinsight:etl-hn                2    Cron（可选）      -
ossinsight:etl-so                2    Cron（可选）      -
ossinsight:sync-github           3    Manual + Cron    limiter: GH API rate
ossinsight:collection            2    Manual           -

* 通过环境变量配置
```

---

## 四、Route Handlers 替代独立 API 服务器

参考 ossinsight-next 的 `/api/queries/[...query]` 模式，将 Fastify API 服务器的职责内嵌到 Next.js `apps/web`，消除独立 API 服务的运维负担。

### 核心理念

ossinsight-next 中的 `executeEndpoint()` 是一个**双环境执行函数**：
- **服务端上下文**（Route Handler 内）：直接执行 SQL → TiDB
- **浏览器上下文**（客户端组件内）：通过 `fetch('/api/q/...')` 调用 Route Handler

查询逻辑收敛到 `packages/core`，Route Handler 只是一个薄薄的适配层。

### Route Handler 结构

```
apps/web/app/api/
├── q/[...query]/
│   └── route.ts          # GET /api/q/{queryName}?{params}
│                         # 执行查询，返回带缓存头的 JSON
├── explorer/
│   ├── questions/
│   │   └── route.ts      # POST：提交 AI 问题（通过 TaskClient 入队）
│   └── [id]/
│       └── route.ts      # GET：轮询 Question 结果
└── collections/
    └── route.ts          # GET /api/collections
```

### 核心查询 Route Handler

```typescript
// apps/web/app/api/q/[...query]/route.ts
import { executeQuery } from '@ossinsight/core'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string[] } }
) {
  const queryName = params.query.join('/')
  const searchParams = Object.fromEntries(request.nextUrl.searchParams)
  const result = await executeQuery(queryName, searchParams)

  return Response.json(result, {
    headers: result.expiresAt
      ? { 'Expires': new Date(result.expiresAt).toUTCString() }
      : {}
  })
}
```

### packages/core 中的双环境 executeQuery

```typescript
// packages/core/src/query/execute.ts

// 服务端：直接执行 SQL（在 Route Handler 或 Server Component 中调用）
export async function executeQuery<T = unknown>(
  queryName: string,
  params: Record<string, string>
): Promise<QueryResult<T>> {
  const config = await loadQueryConfig(queryName)     // 读取 params.json
  const template = await loadQueryTemplate(queryName) // 读取 template.sql
  const cached = await getFromCache(queryName, params, config.cacheHours)
  if (cached) return cached
  const sql = renderSQL(template, config, params)     // LiquidJS 渲染
  const rows = await db.$queryRawUnsafe(sql)          // Prisma 执行
  await setCache(queryName, params, rows, config.cacheHours)
  return { data: rows, params, sql, ... }
}

// 浏览器端：调用 Route Handler（在 Client Component 中使用）
export async function executeQueryClient<T = unknown>(
  queryName: string,
  params: Record<string, string>
): Promise<QueryResult<T>> {
  const res = await fetch(`/api/q/${queryName}?${new URLSearchParams(params)}`)
  return res.json()
}
```

### 缓存策略

| 层级 | 机制 | 适用场景 |
|------|------|---------|
| Redis 缓存 | `cacheHours` 配置，现有逻辑移入 packages/core | 所有查询 |
| Next.js `unstable_cache` | 短期内存缓存 + 按需 revalidate | 公开查询（`public: true`）|
| HTTP `Expires` Header | 浏览器/CDN 缓存 | 长期稳定结果 |

### 向后兼容迁移路径

```
阶段 1：apps/web Route Handler 上线，支持 /api/q/...
阶段 2：前端代码从调用 api.ossinsight.io/q/ 迁移到 /api/q/
阶段 3：api.ossinsight.io DNS 通过反向代理指向 apps/web（外部调用者无感知）
阶段 4：下线独立 Fastify api-server
```

---

## 五、Widget 模块化设计

参考 ossinsight-next 的 Widget 规范，为数据可视化提供声明式、可复用的组件体系。

### 设计理念（参考 ossinsight-next）

```
Query Config (configs/queries/)               ← 数据层：SQL + 参数验证
    ↑ 被 datasource.json 引用
Widget (widgets/*/
├── params.json)                              ← 参数层：Widget 接收的 URL 参数类型
├── datasource.json                           ← 数据绑定层：声明从哪取数据、如何传参
├── visualization.tsx                         ← 视图层：React 渲染组件
└── metadata.ts                              ← 元数据：SEO、标题生成
```

### Widget 目录结构

每个 Widget 是一个独立目录（与 ossinsight-next 完全对应）：

```
widgets/
├── analyze/
│   ├── repo-overview/
│   │   ├── params.json           # Widget URL 参数定义
│   │   ├── datasource.json       # 数据源声明
│   │   ├── visualization.tsx     # React 渲染
│   │   └── metadata.ts           # SEO 元数据
│   ├── stars-history/
│   └── contributors/
├── basic/
│   ├── line-chart/
│   ├── bar-chart/
│   └── world-map/
├── collection/
│   ├── ranking/
│   └── overview/
└── compose/                      # 组合多个 Widget
    └── repo-dashboard/
```

### Widget Params Schema

```json
// widgets/analyze/repo-overview/params.json
{
  "$schema": "../../../schemas/widget/v1/params-schema.json",
  "params": [
    { "name": "repoId",  "type": "repo-id",  "required": true },
    { "name": "period",  "type": "enum",
      "values": ["past_28_days", "past_90_days", "past_year"],
      "default": "past_28_days" }
  ]
}
```

**参数类型（参考 ossinsight-next params-schema）**：

| 类型 | 说明 |
|------|------|
| `repo-id` | GitHub 仓库 ID |
| `user-id` | GitHub 用户 ID |
| `org-id` | GitHub 组织 ID |
| `collection-id` | OSSInsight Collection ID |
| `enum` | 枚举值（配合 `values`）|
| `string` | 自由文本 |
| `integer` | 整数 |
| `day` / `month` | 日期 |
| `time-zone` | 时区标识 |

### Widget Datasource Schema

```json
// widgets/analyze/repo-overview/datasource.json
{
  "$schema": "../../../schemas/widget/v1/datasource-schema.json",
  "datasources": [
    {
      "name": "overview",
      "type": "query",
      "queryName": "analyze-repo-overview",
      "params": { "repoId": "{{ params.repoId }}" }
    },
    {
      "name": "stars",
      "type": "query",
      "queryName": "analyze-stars-history",
      "params": {
        "repoId": "{{ params.repoId }}",
        "period": "{{ params.period }}"
      },
      "when": ["params.repoId"]
    },
    {
      "name": "related",
      "type": "reference",
      "datasource": "overview",
      "selector": "$.related_repos"
    }
  ]
}
```

**Datasource 类型（参考 ossinsight-next datasource-schema）**：

| 类型 | 说明 |
|------|------|
| `query` | 引用 `configs/queries/` 中的查询（通过 Route Handler 或直接 SQL）|
| `api` | 调用外部 HTTP 接口 |
| `reference` | 引用同一 Widget 的另一个 datasource（JSONPath 选取子集，避免重复请求）|

`when` 数组：条件执行，只有当列出的参数存在时才发起该 datasource 请求。

### Widget Visualization

```tsx
// widgets/analyze/repo-overview/visualization.tsx
import { Card, StatCard, LineChart } from '@ossinsight/ui'
import type { WidgetVisualizationProps } from '@ossinsight/core'

export default function RepoOverview({
  data,
  params,
  loading
}: WidgetVisualizationProps<'overview' | 'stars'>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Total Stars"
        value={data.overview?.rows[0]?.stars}
        loading={loading.overview}
      />
      <LineChart
        data={data.stars?.rows}
        xField="event_month"
        yField="stars"
        loading={loading.stars}
      />
    </div>
  )
}
```

### Widget 渲染引擎（packages/core WidgetRenderer）

`packages/core` 提供 `WidgetRenderer`，统一处理数据获取与渲染：

```
apps/web/app/analyze/[owner]/[repo]/page.tsx
    ↓ 使用 WidgetRenderer
packages/core WidgetRenderer
    ├── 解析 params.json → 校验 URL 参数
    ├── 读取 datasource.json → 检查 when 条件
    ├── LiquidJS 渲染参数模板
    ├── 并行执行所有 datasource（服务端直接 SQL，客户端调 /api/q/）
    └── 将 data + loading 注入 visualization.tsx
```

### Widget 路由集成（apps/web）

```
apps/web/app/
├── analyze/[owner]/[repo]/
│   └── page.tsx                  # 使用 WidgetRenderer + widgets/analyze/
├── widgets/[...widget]/
│   └── page.tsx                  # 独立 Widget 展示页（嵌入/分享用）
└── api/widgets/[...widget]/image/
    └── route.ts                  # 服务端静态图片渲染（可选，参考 ossinsight-next）
```

### Widget 代码生成（packages/cli）

受 ossinsight-next `@ossinsight/cli` 启发：

```bash
ossinsight gen-types         # 从 widgets/ 生成 TypeScript 类型定义
ossinsight validate-widgets  # 校验所有 Widget 定义符合 schema
ossinsight list-widgets      # 列出所有 Widget 及其参数
```

---

## 六、新版查询配置 Schema

### 现有设计回顾

`configs/queries/` 每个查询目录包含：
- `params.json`：查询配置（缓存、预热、参数定义）
- `template.sql`：SQL 模板（支持 legacy 字符串替换 和 LiquidJS）

现有 `params.json` 核心字段已经设计得相当完善，新版在**保持完全向后兼容**的前提下渐进式扩展。

### 新版 Schema 设计

Schema 定义文件：`schemas/query/v1/config-schema.json`

```jsonc
// configs/queries/analyze-repo-overview/params.json（升级后示例）
{
  "$schema": "../../schemas/query/v1/config-schema.json",

  // ── 基础信息（新增可选字段）─────────────────────
  "name": "Analyze Repository Overview",
  "description": "Repo star/fork/PR stats overview",
  "tags": ["analyze", "repository"],            // 用于文档分类和发现
  "public": true,
  "deprecated": false,

  // ── SQL 引擎（原有）──────────────────────────────
  "engine": "liquid",                           // "legacy" | "liquid"

  // ── 缓存配置（原有字段名不变）────────────────────
  "cacheProvider": "NORMAL_TABLE",
  "cacheHours": 1,
  "onlyFromCache": false,

  // ── 预热配置（原有字段名不变）────────────────────
  "refreshQueue": "MAIN",                       // 对应新 BullMQ 队列名前缀
  "refreshCron": "@hourly",                     // 支持 ConditionalRefreshCrons

  // ── 参数定义（原有 + 新增 required 字段）────────
  "params": [
    {
      "name": "repoId",
      "replaces": "41986369",
      "type": "integer",
      "required": true,                         // 新增：明确标注必填
      "description": "GitHub repository ID",
      "pattern": "^[1-9]\\d*$"
    },
    {
      "name": "period",
      "replaces": "${period}",
      "type": "string",
      "default": "past_28_days",
      "enums": ["past_28_days", "past_90_days", "past_year"],
      "template": {
        "past_28_days": "INTERVAL 28 DAY",
        "past_90_days": "INTERVAL 90 DAY",
        "past_year":    "INTERVAL 365 DAY"
      }
    }
  ],

  // ── 结果 Schema（新增可选字段）──────────────────
  "resultSchema": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "event_month": { "type": "string" },
        "stars":       { "type": "number" }
      }
    }
  },

  // ── 持久化（原有，不变）──────────────────────────
  "persist": null
}
```

### 新增字段说明

| 新字段 | 类型 | 用途 |
|--------|------|------|
| `$schema` | string | 指向 `schemas/query/v1/config-schema.json`，启用编辑器校验 |
| `name` | string | 人类可读名称，用于文档和 Admin UI |
| `description` | string | 查询描述 |
| `tags` | string[] | 分类标签，用于查询发现和文档生成 |
| `params[].required` | boolean | 明确标注必填参数 |
| `resultSchema` | JSON Schema | 描述结果数据类型，供 CLI 生成 TypeScript 类型 |

### 与 ossinsight-next EndpointConfig 对应关系

| 我们的字段 | ossinsight-next EndpointConfig | 说明 |
|-----------|-------------------------------|------|
| `name` | `name` | 端点名称 |
| `description` | `description` | 描述 |
| `public` | `public` | 是否公开 |
| `deprecated` | `deprecated` | 废弃标志 |
| `params[].name` | `params[].name` | 参数名 |
| `params[].type` | `params[].type` | 类型 |
| `params[].required` | `params[].required` | 必填 |
| `params[].enums` | `params[].enum` | 枚举值 |
| `params[].pattern` | `params[].pattern` | 正则校验 |
| `params[].default` | `params[].default` | 默认值 |
| `resultSchema` | （ossinsight-next 未实现）| 结果类型声明（我们新增）|
| `cacheHours` + `refreshCron` | （ossinsight-next 由 datasource.json 处理）| 缓存/预热（我们保留）|

### Schema 代码生成

`packages/cli gen-query-types` 从 `resultSchema` 自动生成 TypeScript 类型，存入 `packages/core/src/generated/`：

```typescript
// 自动生成：packages/core/src/generated/query-types/analyze-repo-overview.d.ts
export interface AnalyzeRepoOverviewResult {
  event_month: string
  stars: number
}
```

---

## 七、Package 详细设计

### 7.1 `packages/core` — 核心共享层

整个项目中**唯一的 Prisma Client 来源**，以及查询执行逻辑的共享位置。

```
packages/core/
├── prisma/
│   ├── schema.prisma            # prisma db pull 从 TiDB 生成（@@map 保持原表名）
│   └── migrations/             # 仅用于新增表
├── src/
│   ├── db/
│   │   └── client.ts           # 单例 PrismaClient（含连接池配置）
│   ├── query/
│   │   ├── loader.ts           # 读取 configs/queries/*/params.json + template.sql
│   │   ├── parser/
│   │   │   ├── legacy.ts       # 原有字符串替换解析器（保留）
│   │   │   └── liquid.ts       # LiquidJS 模板解析器（保留）
│   │   ├── execute.ts          # executeQuery()（服务端）+ executeQueryClient()（浏览器）
│   │   └── cache.ts            # Redis 缓存逻辑（cacheHours / cacheProvider）
│   ├── widget/
│   │   ├── loader.ts           # 加载 widgets/*/datasource.json + params.json
│   │   ├── renderer.tsx        # WidgetRenderer 组件
│   │   └── types.ts            # WidgetVisualizationProps 等类型
│   ├── task/
│   │   └── client.ts           # TaskClient（通过 Redis 投递 BullMQ Job）
│   └── generated/
│       └── query-types/        # CLI gen-query-types 自动生成
├── index.ts
└── package.json
```

### 7.2 `packages/ui` — 共享组件库

```
packages/ui/
├── src/
│   ├── components/             # shadcn/ui 组件（Button、Card、Table 等）
│   ├── charts/                 # ECharts 封装（LineChart、BarChart、HeatMap 等）
│   └── layout/                 # 布局组件（Sidebar、Header 等）
└── package.json
```

### 7.3 `packages/task-runner` — 统一任务系统

```
packages/task-runner/
├── src/
│   ├── index.ts                # 服务入口（启动所有 Worker 和 Scheduler）
│   ├── registry.ts             # TaskRegistry（自动发现并注册 workers/）
│   ├── workers/
│   │   ├── explorer.worker.ts
│   │   ├── pipeline.worker.ts
│   │   ├── prefetch.worker.ts  # 4 队列
│   │   ├── etl.worker.ts       # 加载 packages/etl 的 handler
│   │   ├── github-sync.worker.ts
│   │   └── collection.worker.ts
│   ├── scheduler/
│   │   ├── pipeline.schedule.ts # 从 configs/pipelines/ 读取 cron
│   │   └── prefetch.schedule.ts # 从 configs/queries/ 读取 refreshCron（含 ConditionalRefreshCrons）
│   └── dashboard.ts            # Bull-board UI
├── Dockerfile
└── package.json
```

### 7.4 `packages/etl` — 数据管道

```
packages/etl/
├── src/
│   ├── sources/
│   │   ├── gharchive.ts        # GitHub Archive 下载（JSON.gz 流式解析）
│   │   └── github-api.ts       # GitHub REST API 数据抓取
│   ├── transforms/
│   │   ├── events.ts           # github_events 数据规范化
│   │   ├── users.ts            # 用户数据处理（含 geocoding）
│   │   └── repos.ts            # 仓库数据处理
│   ├── loaders/
│   │   └── batch-insert.ts     # 批量写入 TiDB（Prisma）
│   └── jobs/                   # 注册到 task-runner 的 Job handler
│       ├── gharchive-sync.ts
│       ├── github-events.ts
│       └── github-sync.ts      # 替代 sync-github-data 的各命令
└── package.json
```

### 7.5 `packages/cli` — ossinsight CLI

**核心原则**：只触发任务（通过 TaskClient），不直接执行业务逻辑。

```bash
# 通用任务管理
ossinsight task run <name> [--payload '{}']
ossinsight task list [--status pending|active|completed|failed]
ossinsight task status <job-id>

# 数据同步（触发 ETL 任务）
ossinsight sync gharchive [--date 2024-01-01]
ossinsight sync github-data [--repo owner/name]

# Pipeline 管理
ossinsight pipeline run <name>
ossinsight pipeline list

# Collection 管理
ossinsight collection reload [--id <id>]
ossinsight collection verify

# 代码生成
ossinsight gen-types           # 从 resultSchema 生成 TypeScript 类型
ossinsight validate-widgets    # 校验 Widget 定义
```

---

## 八、实施分阶段计划

### Phase 1：基础设施（2 周）

- [ ] 初始化 Turborepo（`turbo.json`、`pnpm-workspace.yaml`）
- [ ] 创建 `packages/core`
  - [ ] `prisma db pull` 生成初始 `schema.prisma`（`@@map` 保持原表名）
  - [ ] 验证 Prisma 7 + TiDB 兼容性
  - [ ] 从 api-server `QueryRunner` 迁移 `executeQuery()` 和缓存逻辑
  - [ ] 迁移 LiquidJS + legacy SQL 解析器
- [ ] 创建 `packages/ui`（初始化 shadcn/ui）
- [ ] 创建 `schemas/query/v1/config-schema.json`

### Phase 2：统一任务系统（3 周）

- [ ] 创建 `packages/task-runner`
  - [ ] 实现 TaskRegistry 和队列注册
  - [ ] 迁移 BullMQ Explorer Worker（从 job-server）
  - [ ] Pipeline Scheduler（读取 configs/pipelines/ cron）
  - [ ] 迁移 Pipeline Worker（从 packages/pipeline + toad-scheduler）
  - [ ] Prefetch Scheduler（支持 ConditionalRefreshCrons）
  - [ ] 迁移 Prefetch Worker（本地内存队列 → BullMQ 4 个队列）
  - [ ] Collection Worker
  - [ ] 集成 Bull-board
  - [ ] 实现 `packages/core/src/task/client.ts`
- [ ] 下线 packages/job-server 和 packages/pipeline 中的 toad-scheduler

### Phase 3：Node.js ETL（3 周）

- [ ] 创建 `packages/etl`
  - [ ] GHArchive 下载和流式解析（替代 Ruby）
  - [ ] GitHub Events API 同步
  - [ ] 用户 geocoding（替代 Ruby geocoder）
  - [ ] 批量写入 TiDB（Prisma）
  - [ ] 迁移 sync-github-data 命令为 Job handler
- [ ] 并行运行验证（Ruby ETL vs Node.js ETL 对比输出）
- [ ] 验证通过后下线 `etl/`（Ruby）目录

### Phase 4：CLI 工具（1 周）

- [ ] 创建 `packages/cli`
  - [ ] 基础命令框架（Commander.js）
  - [ ] 接入 TaskClient，实现所有命令组
  - [ ] 迁移现有 collection reload / verify 命令
  - [ ] 实现 gen-types / validate-widgets 命令

### Phase 5：Widget 系统（3 周）

- [ ] 创建 `schemas/widget/v1/`（params-schema、datasource-schema）
- [ ] 在 `packages/core` 实现 WidgetRenderer 和 Widget Loader
- [ ] 迁移基础 Widget（从现有 React 组件）：
  - [ ] `widgets/analyze/repo-overview/`
  - [ ] `widgets/analyze/stars-history/`
  - [ ] `widgets/basic/line-chart/`
  - [ ] `widgets/collection/ranking/`
- [ ] `packages/cli gen-types` 代码生成

### Phase 6：前端应用（4 周）

- [ ] 创建 `apps/web`（Next.js 15）
  - [ ] Route Handler `/api/q/[...query]/route.ts`（替代 Fastify `/q/`）
  - [ ] Route Handler `/api/explorer/`（替代 Fastify explorer 路由）
  - [ ] 迁移仓库分析页面（使用 WidgetRenderer）
  - [ ] 迁移 Collections 页面
  - [ ] 迁移 AI Explorer 页面
  - [ ] 反向代理配置（`api.ossinsight.io` → `apps/web`）
- [ ] 创建 `apps/admin-ui`（Task 管理、Collection CRUD、Pipeline 监控）
- [ ] 创建 `apps/docs`（Next.js 15 + MDX，迁移 Docusaurus）
- [ ] 创建 `apps/blog`（Next.js 15 + MDX）

### Phase 7：清理与测试（持续）

- [ ] 统一 Vitest 配置
- [ ] packages/core 集成测试
- [ ] packages/task-runner 单元测试
- [ ] packages/etl 单元测试
- [ ] apps/web Route Handler e2e 测试
- [ ] 下线 packages/api-server（Route Handler 完全覆盖后）
- [ ] 更新 GitHub Actions CI（Turborepo 增量构建）

---

## 九、不变约束

1. **现有表结构不变**：Prisma 只能新增表，不修改现有表（`@@map` 做映射）
2. **API 向后兼容**：所有现有端点（`/q/`、`/gh/`、`/explorer/`、`/collections/`）响应格式不变
3. **`configs/` 目录不变**：迁移期间 queries/、pipelines/ 保持只读
4. **数据连续性**：ETL 并行验证通过后再切换，不允许数据丢失或重复

---

*计划版本：v2 | 更新日期：2026-02-22*
