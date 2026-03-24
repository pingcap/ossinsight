# Schema 列表 - @ossinsight/database

所有 schema 已从生产数据库自动生成，列名和索引名称完全匹配。

**生成时间:** 2026-03-24  
**来源:** `packages/api-server/__tests__/migrations/*.sql`  
**排除:** `mv_*` 开头的动态物化视图表  
**排除:** 已废弃的表 (cn_orgs, cn_repos, js_framework_repos, css_framework_repos, cached_table_cache)

---

## Schema 列表 (36 个表)

### 核心表 (Core) - 5 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `githubEvents` | `github_events` | GitHub 事件数据 |
| `githubRepos` | `github_repos` | GitHub 仓库元数据 |
| `githubUsers` | `github_users` | GitHub 用户数据 |
| `githubRepoTopics` | `github_repo_topics` | 仓库主题标签 |
| `githubRepoLanguages` | `github_repo_languages` | 仓库编程语言 |

### 集合表 (Collections) - 2 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `collections` | `collections` | 收藏集 |
| `collectionItems` | `collection_items` | 收藏集项目 |

### 框架分类 (Frameworks) - 4 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `dbRepos` | `db_repos` | 数据库相关仓库 |
| `programmingLanguageRepos` | `programming_language_repos` | 编程语言仓库 |
| `staticSiteGeneratorRepos` | `static_site_generator_repos` | 静态站点生成器仓库 |
| `nocodeRepos` | `nocode_repos` | NoCode 工具仓库 |
| `osdbRepos` | `osdb_repos` | OSDB 仓库 |
| `trendingRepos` | `trending_repos` | 趋势仓库 |
| `webFrameworkRepos` | `web_framework_repos` | Web 框架仓库 |

### 缓存表 (Cache) - 2 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `cache` | `cache` | 通用缓存 |
| `locationCache` | `location_cache` | 位置缓存 |

### 日志表 (Logs) - 5 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `accessLogs` | `access_logs` | 访问日志 |
| `eventLogs` | `event_logs` | 事件日志 |
| `importLogs` | `import_logs` | ETL 导入日志 |
| `schemaMigrations` | `schema_migrations` | 数据库迁移记录 |
| `arInternalMetadata` | `ar_internal_metadata` | Rails 内部元数据 |

### 探索器 (Explorer) - 2 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `explorerQuestions` | `explorer_questions` | 探索器问题 |
| `explorerRecommendQuestions` | `explorer_recommend_questions` | 推荐问题 |

### 系统表 (System) - 5 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `sysAccounts` | `sys_accounts` | 系统账户 |
| `sysSubscribedRepos` | `sys_subscribed_repos` | 订阅仓库 |
| `sysRepoMilestones` | `sys_repo_milestones` | 仓库里程碑 |
| `sysRepoMilestoneTypes` | `sys_repo_milestone_types` | 里程碑类型 |
| `sysSentRepoMilestones` | `sys_sent_repo_milestones` | 已发送里程碑 |

### 统计表 (Stats) - 2 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `statsIndexSummary` | `stats_index_summary` | 索引统计 |
| `statsQuerySummary` | `stats_query_summary` | 查询统计 |

### 黑名单 (Blacklist) - 2 个

| Schema | 表名 | 说明 |
|--------|------|------|
| `blacklistRepos` | `blacklist_repos` | 黑名单仓库 |
| `blacklistUsers` | `blacklist_users` | 黑名单用户 |

---

## 已移除的废弃表

以下表已从 schema 中移除，不再使用：

| 表名 | 原因 |
|------|------|
| `cn_orgs` | 已废弃 |
| `cn_repos` | 已废弃 |
| `js_framework_repos` | 已废弃 |
| `css_framework_repos` | 已废弃 |
| `cached_table_cache` | 已废弃 |

---

## 使用示例

### 导入所有 schema

```typescript
import * as schema from '@ossinsight/database';

// 使用特定 schema
const { githubEvents, githubRepos, collections } = schema;
```

### 查询示例

```typescript
import { getDatabase, githubEvents, eq } from '@ossinsight/database';

const db = getDatabase().drizzle;

// 查询今天的事件
const todayEvents = await db
  .select()
  .from(githubEvents)
  .where(eq(githubEvents.event_day, '2026-03-24'))
  .limit(100);

// 查询仓库
const { githubRepos } = await import('@ossinsight/database');
const repos = await db
  .select()
  .from(githubRepos)
  .where(eq(githubRepos.owner_login, 'microsoft'))
  .limit(50);
```

### 类型使用

```typescript
import type { GithubEvent, NewGithubEvent } from '@ossinsight/database';

// 查询结果类型
const event: GithubEvent = await db.select().from(githubEvents).where(...).get();

// 插入数据类型
const newEvent: NewGithubEvent = {
  id: 12345678901n,
  type: 'PushEvent',
  // ...
};
```

---

## Schema 生成脚本

### 从 SQL 生成

```bash
cd packages/database
pnpm tsx scripts/generate-schemas.ts
```

### 从数据库获取

```bash
pnpm tsx scripts/fetch-schema.ts
```

### 修复列名

```bash
pnpm tsx scripts/fix-schema-names.ts
```

---

## 验证 Schema

### 编译检查

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

---

## 注意事项

1. **列名:** 所有列名使用 `snake_case` (与生产数据库一致)
2. **索引:** 所有索引名称完全匹配生产数据库
3. **类型:** 
   - `bigint` 使用 `{ mode: 'number' }`
   - `datetime/timestamp` 使用 `{ mode: 'string', fsp: 3 }`
   - `boolean` 默认值为 `true/false` 而非 `'0'/'1'`
   - `text` 类型不支持 `length` 参数

4. **排除的表:** 
   - `mv_*` 开头的物化视图表 (动态创建)
   - 已废弃的表 (cn_orgs, cn_repos, js_framework_repos, css_framework_repos, cached_table_cache)

---

## 下一步

1. ✅ 所有 schema 已生成
2. ✅ 移除废弃表
3. ⏳ 更新现有代码使用新的 schema
4. ⏳ 迁移 mysql2 查询到 Drizzle ORM
5. ⏳ 添加集成测试

---

**完整列表:** 36 个 schema 文件  
**位置:** `packages/database/src/schema/`  
**状态:** ✅ 已完成
