# Drizzle ORM 快速参考

## 安装

```bash
pnpm add @ossinsight/database
```

## 配置

```bash
export DATABASE_URL="mysql://user:password@host:4000/ossinsight"
```

## 基本使用

### 1. 获取数据库连接

```typescript
import { getDatabase } from '@ossinsight/database';

const db = getDatabase().drizzle;
```

### 2. 查询数据

```typescript
import { githubEvents, eq } from '@ossinsight/database';

const events = await db
  .select()
  .from(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'))
  .limit(100);
```

### 3. 插入数据

```typescript
import { githubEvents, type NewGithubEvent } from '@ossinsight/database';

await db.insert(githubEvents).values({
  id: 12345678901n,
  type: 'PushEvent',
  actorLogin: 'octocat',
  // ...
});
```

### 4. 批量插入

```typescript
await db.insert(githubEvents).values(eventsArray); // 支持 90000+ 条
```

### 5. 更新数据

```typescript
await db
  .update(githubEvents)
  .set({ additions: 150 })
  .where(eq(githubEvents.id, 12345678901n));
```

### 6. Upsert

```typescript
import { sql } from 'drizzle-orm';

await db
  .insert(githubEvents)
  .values(event)
  .onDuplicateKeyUpdate({
    additions: sql`VALUES(additions)`,
    deletions: sql`VALUES(deletions)`,
  });
```

## 常用操作符

```typescript
import { eq, and, or, gt, lt, gte, lte, inArray, like, sql } from '@ossinsight/database';

// 等于
eq(githubEvents.actorLogin, 'octocat')

// 与/或
and(eq(...), gt(...))
or(eq(...), lt(...))

// 比较
gt(githubEvents.additions, 100)    // >
gte(githubEvents.additions, 100)   // >=
lt(githubEvents.deletions, 50)     // <
lte(githubEvents.deletions, 50)    // <=

// IN
inArray(githubEvents.type, ['PushEvent', 'PullRequestEvent'])

// LIKE
like(githubEvents.repoName, '%typescript%')

// 原生 SQL
sql`COUNT(*)`
sql`SUM(${githubEvents.additions})`
sql`DATE_FORMAT(${githubEvents.createdAt}, '%Y-%m-%d')`
```

## 聚合查询

```typescript
import { count, countDistinct, sum, avg } from 'drizzle-orm';

const stats = await db
  .select({
    day: githubEvents.eventDay,
    totalEvents: count(),
    uniqueActors: countDistinct(githubEvents.actorId),
    totalAdditions: sum(githubEvents.additions),
    avgAdditions: avg(githubEvents.additions),
  })
  .from(githubEvents)
  .groupBy(githubEvents.eventDay)
  .orderBy(githubEvents.eventDay);
```

## 连接查询

```typescript
import { githubRepos } from '@ossinsight/database';

const eventsWithRepos = await db
  .select({
    event: githubEvents,
    repo: githubRepos,
  })
  .from(githubEvents)
  .leftJoin(githubRepos, eq(githubEvents.repoId, githubRepos.repoId))
  .where(eq(githubEvents.eventDay, '2026-03-23'));
```

## 删除数据

```typescript
// 条件删除
await db
  .delete(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'))
  .limit(10000);
```

## 事务

```typescript
import { getDatabase } from '@ossinsight/database';

const db = getDatabase();

await db.pool.transaction(async (conn) => {
  // 使用连接执行事务操作
  await conn.execute('INSERT INTO ...');
  await conn.execute('UPDATE ...');
});
```

## 类型推断

```typescript
import { githubEvents, type GithubEvent, type NewGithubEvent } from '@ossinsight/database';

// 查询结果类型
type Event = typeof githubEvents.$inferSelect;

// 插入类型
type NewEvent = typeof githubEvents.$inferInsert;

// 使用
const event: NewGithubEvent = { /* ... */ };
const result: GithubEvent = await db.select().from(githubEvents).where(...).get();
```

## 最佳实践

### ✅ 推荐

```typescript
// 批量插入
await db.insert(githubEvents).values(events);

// 使用连接池
const db = getDatabase();

// 类型安全查询
await db.select().from(githubEvents).where(eq(githubEvents.id, 123n));

// 限制结果
await db.select().from(githubEvents).limit(100);
```

### ❌ 避免

```typescript
// 单条插入循环
for (const event of events) {
  await db.insert(githubEvents).values(event); // 慢！
}

// 创建多个连接
const db1 = getDatabase();
const db2 = getDatabase(); // 应该复用

// 无限制查询
await db.select().from(githubEvents); // 可能返回百万条！
```

## 迁移命令

```bash
cd packages/database

# 生成迁移
pnpm generate

# 运行迁移
pnpm migrate

# 打开 Studio
pnpm studio
```

## 示例代码

### 按天统计事件

```typescript
const dailyStats = await db
  .select({
    day: githubEvents.eventDay,
    count: count(),
  })
  .from(githubEvents)
  .groupBy(githubEvents.eventDay)
  .orderBy(githubEvents.eventDay)
  .limit(30);
```

### 活跃用户排行

```typescript
const topUsers = await db
  .select({
    actorLogin: githubEvents.actorLogin,
    events: count(),
  })
  .from(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'))
  .groupBy(githubEvents.actorLogin)
  .orderBy((t) => desc(t.events))
  .limit(10);
```

### 仓库事件趋势

```typescript
const repoTrend = await db
  .select({
    repo: githubEvents.repoName,
    day: githubEvents.eventDay,
    events: count(),
  })
  .from(githubEvents)
  .where(
    and(
      eq(githubEvents.repoName, 'microsoft/typescript'),
      gte(githubEvents.eventDay, '2026-03-01')
    )
  )
  .groupBy(githubEvents.repoName, githubEvents.eventDay)
  .orderBy(githubEvents.eventDay);
```

---

**完整文档:** [packages/database/README.md](packages/database/README.md)  
**迁移计划:** [DRIZZLE_MIGRATION_PLAN.md](DRIZZLE_MIGRATION_PLAN.md)
