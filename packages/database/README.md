# @ossinsight/database

Unified database layer for OSS Insight using **Drizzle ORM + mysql2**.

## Features

- 🎯 Type-safe queries with Drizzle ORM
- 🔌 Connection pooling with mysql2
- 📝 Schema-first development
- 🔄 Automatic migrations
- 🌐 TiDB Cloud compatible

## Installation

```bash
pnpm add @ossinsight/database
```

## Quick Start

### 1. Setup Environment

```bash
export DATABASE_URL="mysql://user:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={\"rejectUnauthorized\":true}"
```

### 2. Create Database Connection

```typescript
import { getDatabase, githubEvents } from '@ossinsight/database';

const db = getDatabase();

// Query with Drizzle ORM
const events = await db.drizzle
  .select()
  .from(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'))
  .limit(100);

console.log(`Found ${events.length} events`);
```

### 3. Insert Data

```typescript
import { getDatabase, githubEvents, type NewGithubEvent } from '@ossinsight/database';

const db = getDatabase();

const newEvent: NewGithubEvent = {
  id: 12345678901,
  type: 'PushEvent',
  actorId: 123456,
  actorLogin: 'octocat',
  repoId: 789012,
  repoName: 'octocat/hello-world',
  orgId: 0,
  orgLogin: '',
  createdAt: '2026-03-24 07:00:00',
  language: 'TypeScript',
  additions: 100,
  deletions: 50,
  action: '',
  number: 0,
  commitId: '',
  commentId: 0,
  state: '',
  closedAt: '1970-01-01 00:00:00',
  comments: 0,
  prMerged: false,
  prMergedAt: '1970-01-01 00:00:00',
  prChangedFiles: 0,
  prReviewComments: 0,
  prOrIssueId: 0,
  pushSize: 3,
  pushDistinctSize: 2,
  creatorUserId: 123456,
  creatorUserLogin: 'octocat',
  prOrIssueCreatedAt: '1970-01-01 00:00:00',
  eventDay: '2026-03-24',
  eventMonth: '2026-03-01',
  eventYear: 2026,
};

await db.drizzle.insert(githubEvents).values(newEvent);
```

### 4. Batch Insert

```typescript
import { getDatabase, githubEvents } from '@ossinsight/database';

const db = getDatabase();

const events: NewGithubEvent[] = [/* ... */];

// Insert in batches
await db.drizzle.insert(githubEvents).values(events);
```

### 5. Update/Upsert

```typescript
import { getDatabase, githubEvents } from '@ossinsight/database';

const db = getDatabase();

// Update
await db.drizzle
  .update(githubEvents)
  .set({ additions: 150 })
  .where(eq(githubEvents.id, 12345678901));

// Upsert (MySQL specific)
await db.drizzle
  .insert(githubEvents)
  .values(event)
  .onDuplicateKeyUpdate({ 
    additions: 150,
    deletions: 75 
  });
```

## Available Schemas

| Schema | Table | Description |
|--------|-------|-------------|
| `githubEvents` | `github_events` | GitHub event data (from Ruby ETL) |
| `importLogs` | `import_logs` | ETL import job tracking |

More schemas coming soon:
- `githubRepos` - Repository metadata
- `githubUsers` - User profiles
- `collections` - Curated collections
- `cnRepos` - Chinese repos
- `cnOrgs` - Chinese organizations

## API Reference

### Database Connection

```typescript
import { createDatabase, getDatabase, resetDatabase } from '@ossinsight/database';

// Create new connection
const db = createDatabase({
  url: 'mysql://...',
  connectionLimit: 20,
});

// Get global instance (singleton)
const db = getDatabase();

// Reset (for testing)
resetDatabase();

// Close connection
await db.close();
```

### Query Builder

```typescript
import { getDatabase, githubEvents, eq, and, gt, lt } from '@ossinsight/database';

const db = getDatabase();

// Select
const events = await db.drizzle
  .select()
  .from(githubEvents)
  .where(
    and(
      eq(githubEvents.eventDay, '2026-03-23'),
      gt(githubEvents.actorId, 1000)
    )
  )
  .limit(100)
  .offset(0);

// Count
const count = await db.drizzle
  .select({ count: count() })
  .from(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'));

// Aggregation
const stats = await db.drizzle
  .select({
    day: githubEvents.eventDay,
    totalEvents: count(),
    uniqueActors: countDistinct(githubEvents.actorId),
    totalAdditions: sum(githubEvents.additions),
  })
  .from(githubEvents)
  .groupBy(githubEvents.eventDay)
  .orderBy(githubEvents.eventDay);
```

## Migrations

### Generate Migrations

```bash
cd packages/database
pnpm generate
```

This creates SQL migration files in `./migrations/`.

### Run Migrations

```bash
pnpm migrate
```

### Open Drizzle Studio

```bash
pnpm studio
```

Drizzle Studio provides a web UI to browse your database schema and data.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Primary database connection | `mysql://user:pass@host:4000/db` |
| `BACKGROUND_DATABASE_URL` | Alternative (used by background service) | Same as above |

### TiDB Cloud Connection

```bash
DATABASE_URL="mysql://user.root:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={\"rejectUnauthorized\":true}"
```

Note the `.root` suffix for serverless tier users.

## Project Structure

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── index.ts           # Schema exports
│   │   ├── github-events.ts   # github_events table
│   │   └── import-logs.ts     # import_logs table
│   ├── index.ts               # Main exports
│   └── types.ts               # Type definitions
├── scripts/
│   └── migrate.ts             # Migration runner
├── migrations/                 # Generated SQL migrations
├── drizzle.config.ts          # Drizzle Kit config
├── package.json
└── tsconfig.json
```

## Integration Examples

### With @ossinsight/background

```typescript
// packages/background/src/tasks/gharchive.ts
import { getDatabase, githubEvents, type NewGithubEvent } from '@ossinsight/database';

const db = getDatabase();

// Replace raw SQL with Drizzle
await db.drizzle.insert(githubEvents).values(events);
```

### With @ossinsight/api-server

```typescript
// packages/api-server/src/plugins/services/event-service.ts
import { getDatabase, githubEvents, eq } from '@ossinsight/database';

export class EventService {
  private db = getDatabase();

  async getEventsByDay(day: string) {
    return this.db.drizzle
      .select()
      .from(githubEvents)
      .where(eq(githubEvents.eventDay, day));
  }
}
```

### With @ossinsight/pipeline

```typescript
// packages/pipeline/src/utils/db.ts
import { getDatabase } from '@ossinsight/database';

const db = getDatabase();
export { db };
```

## Benefits Over Raw SQL

| Feature | Raw mysql2 | Drizzle ORM |
|---------|-----------|-------------|
| Type Safety | ❌ | ✅ Full TypeScript |
| Autocomplete | ❌ | ✅ IDE support |
| Refactoring | Hard | Easy |
| Query Building | Manual | Fluent API |
| Migrations | Manual SQL | Auto-generated |
| Schema Validation | Runtime | Compile-time |

## Migration from mysql2

### Before (mysql2)

```typescript
import { createPool } from 'mysql2/promise';

const pool = createPool({ /* ... */ });

const [rows] = await pool.execute(
  'SELECT * FROM github_events WHERE event_day = ?',
  ['2026-03-23']
);
```

### After (Drizzle ORM)

```typescript
import { getDatabase, githubEvents, eq } from '@ossinsight/database';

const db = getDatabase();

const events = await db.drizzle
  .select()
  .from(githubEvents)
  .where(eq(githubEvents.eventDay, '2026-03-23'));
```

## Performance

Drizzle ORM has minimal overhead:

- **Query performance:** ~1-2% slower than raw SQL
- **Memory:** ~5MB additional
- **Bundle size:** ~50KB (gzipped)

For bulk operations, use batch inserts:

```typescript
// ✅ Good: Batch insert
await db.drizzle.insert(githubEvents).values(events); // 90000 at once

// ❌ Bad: Individual inserts
for (const event of events) {
  await db.drizzle.insert(githubEvents).values(event);
}
```

## Troubleshooting

### Connection Refused

```bash
# Check database is accessible
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u user -p -e "SELECT 1"
```

### SSL Error (TiDB Cloud)

Ensure your connection string includes SSL:

```bash
DATABASE_URL="mysql://...?ssl={\"rejectUnauthorized\":true}"
```

### Type Errors

Make sure you're using the correct types:

```typescript
import type { NewGithubEvent } from '@ossinsight/database';

const event: NewGithubEvent = { /* ... */ };
```

## License

Apache-2.0 © OSS Insight Team
