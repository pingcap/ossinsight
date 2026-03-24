# Schema 列表 - @ossinsight/database

所有 schema 已从生产数据库自动生成，列名和索引名称完全匹配。

**生成时间:** 2026-03-24  
**来源:** `packages/api-server/__tests__/migrations/*.sql`  
**排除:** `mv_*` 开头的动态物化视图表

---

## Schema 列表 (41 个表)

### 核心表 (Core)

| Schema | 表名 | 说明 |
|--------|------|------|
| `githubEvents` | `github_events` | GitHub 事件数据 |
| `githubRepos` | `github_repos` | GitHub 仓库元数据 |
| `githubUsers` | `github_users` | GitHub 用户数据 |
| `githubRepoTopics` | `github_repo_topics` | 仓库主题标签 |
| `githubRepoLanguages` | `github_repo_languages` | 仓库编程语言 |

### 集合表 (Collections)

| Schema | 表名 | 说明 |
|--------|------|------|
| `collections` | `collections` | 收藏集 |
| `collectionItems` | `collection_items` | 收藏集项目 |

### 中国相关 (China)

| Schema | 表名 | 说明 |
|--------|------|------|
| `cnOrgs` | `cn_orgs` | 中国组织 |
| `cnRepos` | `cn_repos` | 中国仓库 |

### 框架分类 (Frameworks)

| Schema | 表名 | 说明 |
|--------|------|------|
| `jsFrameworkRepos` | `js_framework_repos` | JavaScript 框架仓库 |
| `cssFrameworkRepos` | `css_framework_repos` | CSS 框架仓库 |
| `webFrameworkRepos` | `web_framework_repos` | Web 框架仓库 |
| `dbRepos` | `db_repos` | 数据库相关仓库 |
| `programmingLanguageRepos` | `programming_language_repos` | 编程语言仓库 |
| `staticSiteGeneratorRepos` | `static_site_generator_repos` | 静态站点生成器仓库 |
| `nocodeRepos` | `nocode_repos` | NoCode 工具仓库 |
| `osdbRepos` | `osdb_repos` | OSDB 仓库 |
| `trendingRepos` | `trending_repos` | 趋势仓库 |

### 缓存表 (Cache)

| Schema | 表名 | 说明 |
|--------|------|------|
| `cache` | `cache` | 通用缓存 |
| `cachedTableCache` | `cached_table_cache` | 缓存表数据 |
| `locationCache` | `location_cache` | 位置缓存 |

### 日志表 (Logs)

| Schema | 表名 | 说明 |
|--------|------|------|
| `accessLogs` | `access_logs` | 访问日志 |
| `eventLogs` | `event_logs` | 事件日志 |
| `importLogs` | `import_logs` | ETL 导入日志 |
| `schemaMigrations` | `schema_migrations` | 数据库迁移记录 |
| `arInternalMetadata` | `ar_internal_metadata` | Rails 内部元数据 |

### 探索器 (Explorer)

| Schema | 表名 | 说明 |
|--------|------|------|
| `explorerQuestions` | `explorer_questions` | 探索器问题 |
| `explorerRecommendQuestions` | `explorer_recommend_questions` | 推荐问题 |

### 系统表 (System)

| Schema | 表名 | 说明 |
|--------|------|------|
| `sysAccounts` | `sys_accounts` | 系统账户 |
| `sysSubscribedRepos` | `sys_subscribed_repos` | 订阅仓库 |
| `sysRepoMilestones` | `sys_repo_milestones` | 仓库里程碑 |
| `sysRepoMilestoneTypes` | `sys_repo_milestone_types` | 里程碑类型 |
| `sysSentRepoMilestones` | `sys_sent_repo_milestones` | 已发送里程碑 |

### 统计表 (Stats)

| Schema | 表名 | 说明 |
|--------|------|------|
| `statsIndexSummary` | `stats_index_summary` | 索引统计 |
| `statsQuerySummary` | `stats_query_summary` | 查询统计 |

### 黑名单 (Blacklist)

| Schema | 表名 | 说明 |
|--------|------|------|
| `blacklistRepos` | `blacklist_repos` | 黑名单仓库 |
| `blacklistUsers` | `blacklist_users` | 黑名单用户 |

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
   - 共排除约 15 个 mv_ 表

---

## 下一步

1. ✅ 所有 schema 已生成
2. ⏳ 更新现有代码使用新的 schema
3. ⏳ 迁移 mysql2 查询到 Drizzle ORM
4. ⏳ 添加集成测试

---

**完整列表:** 41 个 schema 文件  
**位置:** `packages/database/src/schema/`  
**状态:** ✅ 已完成
