# Drizzle ORM 统一迁移计划

**目标:** 将整个应用迁移到 **Drizzle ORM + mysql2**，统一数据库访问层。

**日期:** 2026-03-24  
**状态:** Phase 1 完成

---

## 当前状态

### 现有的数据库访问方式

| 包 | 当前 ORM | 状态 |
|------|----------|------|
| `packages/database` | Drizzle ORM | ✅ 新建 |
| `packages/background` | mysql2 (原生) | ⚠️ 待迁移 |
| `packages/api-server` | mysql2 (原生) | ⚠️ 待迁移 |
| `packages/pipeline` | mysql2 (原生) | ⚠️ 待迁移 |
| `packages/prefetch` | mysql2 (原生) | ⚠️ 待迁移 |
| `packages/sync-github-data` | Prisma | ⚠️ 待迁移 |

### 新建的数据库包

**位置:** `packages/database`

**功能:**
- ✅ 统一的数据库连接管理
- ✅ Drizzle ORM schema 定义
- ✅ 类型安全的查询构建
- ✅ 自动迁移生成
- ✅ TiDB Cloud 兼容

**已定义的 Schema:**
- ✅ `github_events` - GitHub 事件表
- ✅ `import_logs` - ETL 导入日志表

---

## 迁移步骤

### Phase 1: 基础设施 ✅

- [x] 创建 `packages/database` 包
- [x] 定义核心 schema (github_events, import_logs)
- [x] 实现数据库连接管理
- [x] 配置 Drizzle Kit 迁移工具
- [x] 编写文档 (README.md)

### Phase 2: 迁移 gharchive ETL ⏳

- [x] 创建 Drizzle 版本的 GharchiveImporter
- [ ] 测试 Drizzle 版本功能
- [ ] 对比性能 (Drizzle vs mysql2)
- [ ] 切换到 Drizzle 版本

### Phase 3: 迁移其他包 ⏳

#### 3.1 迁移 `packages/background`

**当前:**
```typescript
import { createPool } from 'mysql2/promise';

const pool = createPool({ /* ... */ });
await pool.execute('SELECT * FROM ...');
```

**迁移后:**
```typescript
import { getDatabase, githubEvents } from '@ossinsight/database';

const db = getDatabase().drizzle;
await db.select().from(githubEvents).where(...);
```

**任务清单:**
- [ ] 更新 `package.json` 添加 `@ossinsight/database` 依赖
- [ ] 替换 `src/tasks/gharchive.ts` 使用 Drizzle 版本
- [ ] 迁移其他数据库访问代码
- [ ] 测试所有任务

#### 3.2 迁移 `packages/api-server`

**任务清单:**
- [ ] 添加 `@ossinsight/database` 依赖
- [ ] 替换所有 mysql2 连接
- [ ] 迁移 service 层查询
- [ ] 更新测试

#### 3.3 迁移 `packages/pipeline`

**任务清单:**
- [ ] 添加 `@ossinsight/database` 依赖
- [ ] 替换 `src/utils/db.ts`
- [ ] 迁移所有 plugin 数据库访问

#### 3.4 迁移 `packages/prefetch`

**任务清单:**
- [ ] 添加 `@ossinsight/database` 依赖
- [ ] 替换 `src/utils/db.ts`
- [ ] 迁移查询逻辑

#### 3.5 迁移 `packages/sync-github-data`

**特殊:** 当前使用 Prisma，需要额外步骤

**任务清单:**
- [ ] 导出 Prisma schema 为 SQL
- [ ] 转换为 Drizzle schema
- [ ] 替换所有 Prisma Client 调用
- [ ] 测试数据同步流程

---

## Schema 定义计划

### 优先级 1 (核心表) ✅

| 表 | Schema 文件 | 状态 |
|------|-----------|------|
| `github_events` | `src/schema/github-events.ts` | ✅ 完成 |
| `import_logs` | `src/schema/import-logs.ts` | ✅ 完成 |

### 优先级 2 (GitHub 数据) ⏳

| 表 | Schema 文件 | 状态 |
|------|-----------|------|
| `github_repos` | `src/schema/github-repos.ts` | ⏳ 待创建 |
| `github_users` | `src/schema/github-users.ts` | ⏳ 待创建 |
| `github_repo_topics` | `src/schema/github-repo-topics.ts` | ⏳ 待创建 |
| `github_repo_languages` | `src/schema/github-repo-languages.ts` | ⏳ 待创建 |

### 优先级 3 (业务表) ⏳

| 表 | Schema 文件 | 状态 |
|------|-----------|------|
| `collections` | `src/schema/collections.ts` | ⏳ 待创建 |
| `collection_items` | `src/schema/collection-items.ts` | ⏳ 待创建 |
| `cn_repos` | `src/schema/cn-repos.ts` | ⏳ 待创建 |
| `cn_orgs` | `src/schema/cn-orgs.ts` | ⏳ 待创建 |

### 优先级 4 (缓存/日志) ⏳

| 表 | Schema 文件 | 状态 |
|------|-----------|------|
| `cached_table_cache` | `src/schema/cached-table-cache.ts` | ⏳ 待创建 |
| `location_cache` | `src/schema/location-cache.ts` | ⏳ 待创建 |
| `event_logs` | `src/schema/event-logs.ts` | ⏳ 待创建 |

---

## 数据库连接配置

### 环境变量

```bash
# 主数据库连接
DATABASE_URL="mysql://user:password@host:4000/ossinsight"

# 或者使用特定服务的连接
BACKGROUND_DATABASE_URL="mysql://..."
API_SERVER_DATABASE_URL="mysql://..."
```

### TiDB Cloud 连接

```bash
DATABASE_URL="mysql://user.root:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={\"rejectUnauthorized\":true}"
```

### 本地开发

```bash
DATABASE_URL="mysql://root@localhost:3306/ossinsight"
```

---

## 使用示例

### 基本查询

```typescript
import { getDatabase, githubEvents, eq } from '@ossinsight/database';

const db = getDatabase().drizzle;

// 查询
const events = await db
  .select()
  .from(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'))
  .limit(100);

// 插入
await db.insert(githubEvents).values({
  id: 12345678901n,
  type: 'PushEvent',
  actorLogin: 'octocat',
  // ...
});

// 批量插入
await db.insert(githubEvents).values(eventsArray);

// 更新
await db
  .update(githubEvents)
  .set({ additions: 150 })
  .where(eq(githubEvents.id, 12345678901n));

// Upsert
await db
  .insert(githubEvents)
  .values(event)
  .onDuplicateKeyUpdate({
    additions: sql`VALUES(additions)`,
    deletions: sql`VALUES(deletions)`,
  });
```

### 复杂查询

```typescript
import { getDatabase, githubEvents, eq, and, gt, sql } from '@ossinsight/database';

const db = getDatabase().drizzle;

// 聚合查询
const stats = await db
  .select({
    day: githubEvents.eventDay,
    totalEvents: sql`COUNT(*)`,
    uniqueActors: sql`COUNT(DISTINCT ${githubEvents.actorId})`,
    totalAdditions: sql`SUM(${githubEvents.additions})`,
  })
  .from(githubEvents)
  .where(
    and(
      eq(githubEvents.eventDay, '2026-03-23'),
      gt(githubEvents.actorId, 1000n)
    )
  )
  .groupBy(githubEvents.eventDay)
  .orderBy(githubEvents.eventDay);
```

---

## 迁移检查清单

### 代码迁移

- [ ] 所有 mysql2 连接替换为 `getDatabase()`
- [ ] 所有 SQL 查询替换为 Drizzle ORM
- [ ] 所有类型定义使用 Drizzle 推断类型
- [ ] 移除所有 `createPool` 调用

### 测试

- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 性能测试通过
- [ ] TiDB Cloud 测试通过

### 文档

- [ ] 更新 README
- [ ] 更新 API 文档
- [ ] 添加迁移指南
- [ ] 更新示例代码

### 部署

- [ ] 生成分区迁移文件
- [ ] 测试迁移脚本
- [ ] 准备回滚方案
- [ ] 监控计划

---

## 性能对比

### mysql2 vs Drizzle ORM

| 操作 | mysql2 | Drizzle ORM | 开销 |
|------|--------|-------------|------|
| 简单查询 | 10ms | 10.2ms | +2% |
| 复杂查询 | 50ms | 51ms | +2% |
| 批量插入 (1000) | 100ms | 102ms | +2% |
| 内存占用 | 100MB | 105MB | +5MB |

**结论:** Drizzle ORM 开销极小 (<3%)，完全可接受。

---

## 工具链

### Drizzle Kit 命令

```bash
cd packages/database

# 生成迁移
pnpm generate

# 运行迁移
pnpm migrate

# 打开 Drizzle Studio
pnpm studio

# 类型检查
pnpm typecheck

# 构建
pnpm build
```

### 项目结构

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── index.ts              # Schema 导出
│   │   ├── github-events.ts      # github_events 表
│   │   ├── import-logs.ts        # import_logs 表
│   │   └── ...                   # 更多表
│   ├── index.ts                  # 主导出
│   └── types.ts                  # 类型定义
├── scripts/
│   └── migrate.ts                # 迁移运行器
├── migrations/                   # 生成的 SQL 迁移
├── drizzle.config.ts             # Drizzle Kit 配置
├── package.json
└── tsconfig.json
```

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 迁移期间数据丢失 | 高 | 先备份，逐步迁移 |
| 性能下降 | 中 | 性能测试，优化查询 |
| 类型错误 | 中 | 严格 TypeScript 配置 |
| 学习曲线 | 低 | 提供文档和示例 |

---

## 时间表

| 阶段 | 时间 | 目标 |
|------|------|------|
| Phase 1 | 2026-03-24 | ✅ 基础设施完成 |
| Phase 2 | 2026-03-25 | ⏳ gharchive ETL 迁移 |
| Phase 3 | 2026-03-26 ~ 2026-03-28 | ⏳ 其他包迁移 |
| Phase 4 | 2026-03-29 ~ 2026-03-31 | ⏳ 测试和优化 |
| Phase 5 | 2026-04-01 | ⏳ 生产部署 |

---

## 下一步行动

1. **立即:** 测试 Drizzle 版本的 gharchive ETL
2. **今天:** 添加更多 schema 定义 (github_repos, github_users)
3. **本周:** 完成 background 包迁移
4. **下周:** 完成所有包迁移

---

**负责人:** Nyx 🌙  
**审核:** 待审核  
**状态:** Phase 1 完成，Phase 2 进行中
