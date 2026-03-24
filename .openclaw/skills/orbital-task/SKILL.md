---
name: orbital-task
description: 'Enqueue and manage background tasks using @ossinsight/orbital-service. Use for: (1) GitHub data sync (users/repos/events), (2) query prefetch and caching, (3) ETL pipeline processing. NOT for: real-time API requests, user-facing synchronous operations.'
metadata:
  {
    "openclaw": { "emoji": "🛰️", "requires": { "packages": ["@ossinsight/orbital-service"] } },
  }
---

# Orbital Task Scheduler

Enqueue and manage background tasks using the OSS Insight Orbital service.

## 🚀 Quick Start

### Enqueue a Task

```bash
# GitHub User Sync
cd packages/orbital-service
node -e "
const { getOrbitalService } = require('./dist/index.js');
const service = getOrbitalService();
service.enqueue('github.sync.user', { userId: 12345, username: 'octocat' });
"

# Query Prefetch
node -e "
const { getOrbitalService } = require('./dist/index.js');
const service = getOrbitalService();
service.enqueue('prefetch.query', {
  queryId: 'popular-repos-2024',
  query: 'SELECT * FROM repos ORDER BY stars DESC LIMIT 100',
  ttl: 3600
});
"

# ETL Pipeline
node -e "
const { getOrbitalService } = require('./dist/index.js');
const service = getOrbitalService();
service.enqueue('etl.process', {
  pipelineId: 'daily-aggregation',
  source: 'github_events',
  destination: 'analytics_tables'
});
"
```

### Start Services

```bash
# Start scheduler (run once)
pnpm --filter @ossinsight/orbital-service start

# Start worker (run on each worker node)
pnpm --filter @ossinsight-service worker
```

---

## 📋 Available Tasks

### GitHub Sync

| Task | Data | Description |
|------|------|-------------|
| `github.sync.user` | `{ userId, username, force? }` | Sync user profile and repos |
| `github.sync.repo` | `{ repoId, owner, name, force? }` | Sync repository data |
| `github.sync.events` | `{ since?, limit? }` | Sync GitHub events |

**Scheduled:** `github.daily.full-sync` (2 AM daily)

### Query Prefetch

| Task | Data | Description |
|------|------|-------------|
| `prefetch.query` | `{ queryId, query, params?, ttl?, priority? }` | Execute and cache query |
| `prefetch.cache` | `{ cacheKey, strategy, ttl? }` | Update cache layer |

**Scheduled:** 
- `prefetch.hourly.refresh` (every hour)
- `prefetch.daily.cleanup` (3 AM daily)

### ETL Pipeline

| Task | Data | Description |
|------|------|-------------|
| `etl.process` | `{ pipelineId, source, destination, options? }` | Run ETL pipeline |
| `etl.transform` | `{ transformId, input, output, transformType }` | Transform data |
| `etl.load` | `{ loadId, data, target, mode }` | Load data to target |

**Scheduled:** `etl.daily.process` (1 AM daily)

---

## 🔧 Programmatic Usage

```typescript
import { getOrbitalService } from '@ossinsight/orbital-service';

const service = getOrbitalService();
await service.start();

// Enqueue task
const jobId = await service.enqueue('github.sync.user', {
  userId: 12345,
  username: 'octocat',
  force: true,
});

// Schedule recurring job
service.schedule('custom.job', '*/5 * * * *', async () => {
  await performCustomTask();
});
```

---

## 🌐 Environment Variables

```bash
# Required
ORBITAL_REDIS_URL=redis://localhost:6379
ORBITAL_DATABASE_URL=mysql://localhost:3306/ossinsight

# Optional
ORBITAL_WORKER_CONCURRENCY=10
ORBITAL_LOG_LEVEL=info
```

---

## 📊 Monitoring

### Check Task Status

```typescript
const status = await service.scheduler.getTaskStatus(jobId);
console.log(status);
// { status: 'completed' | 'running' | 'failed' | 'pending', ... }
```

### Logs

Logs are output via Pino:

```bash
# Debug mode
ORBITAL_LOG_LEVEL=debug pnpm start

# Production
ORBITAL_LOG_LEVEL=info pnpm start
```

---

## ⚠️ Best Practices

### DO

- Use for long-running background tasks
- Set appropriate TTL for cached queries
- Handle retries in task handlers
- Log task progress and errors
- Use priority for time-sensitive tasks

### DON'T

- Use for real-time user requests
- Enqueue tasks without error handling
- Forget to start the scheduler
- Ignore failed task logs
- Run multiple schedulers (single instance only)

---

## 🐛 Troubleshooting

### Task Not Processing

1. Check if scheduler is running: `orbital-service status`
2. Check if workers are connected
3. Verify Redis connection: `redis-cli ping`
4. Check logs for errors

### Redis Connection Failed

```bash
# Test Redis
redis-cli -h localhost -p 6379 ping

# Should return: PONG
```

### Database Connection Failed

```bash
# Test MySQL/TiDB
mysql -h localhost -u root -p -e "SELECT 1"
```

---

## 📚 Related

- **Integration Plan:** `ORBITAL_INTEGRATION_PLAN.md`
- **Main README:** `packages/orbital-service/README.md`
- **Source Code:** `packages/orbital-service/src/`
