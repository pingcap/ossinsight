# @ossinsight/background

Shared background task scheduler service for OSS Insight using Orbital.

## Installation

```bash
pnpm add @ossinsight/background
```

## Quick Start

### 1. Setup Database

```bash
# Using TiDB Cloud (production)
export BACKGROUND_DATABASE_URL="mysql://user:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight"

# Or using local MySQL (development)
export BACKGROUND_DATABASE_URL="mysql://root@localhost:3306/ossinsight"

# Setup tables
pnpm setup:db
```

### 2. Setup Redis

```bash
# Using local Redis
export BACKGROUND_REDIS_URL="redis://localhost:6379"

# Test connection
redis-cli ping  # Should return: PONG
```

### 3. Start the Scheduler

```bash
# Start the scheduler (single instance)
pnpm start

# Or using CLI
background-service start
```

### 4. Start Workers

```bash
# Start a worker (can run multiple instances)
pnpm worker

# Or using CLI
background-service worker
```

## Programmatic Usage

```typescript
import { getBackgroundService, createBackgroundService } from '@ossinsight/background';

// Get default service (uses env vars)
const service = getBackgroundService();
await service.start();

// Or create custom instance
const customService = createBackgroundService({
  redisUrl: 'redis://your-redis:6379',
  databaseUrl: 'mysql://your-db:3306/ossinsight',
  workerConcurrency: 20,
  logLevel: 'debug',
});

await customService.start();
```

### Enqueue Tasks

```typescript
// GitHub Sync
await service.enqueue('github.sync.user', {
  userId: 12345,
  username: 'octocat',
  force: true,
});

// Query Prefetch
await service.enqueue('prefetch.query', {
  queryId: 'popular-repos-2024',
  query: 'SELECT * FROM repos ORDER BY stars DESC LIMIT 100',
  ttl: 3600,
  priority: 10,
});

// ETL Pipeline
await service.enqueue('etl.process', {
  pipelineId: 'daily-aggregation',
  source: 'github_events',
  destination: 'analytics_tables',
  options: { batchSize: 1000 },
});
```

### Schedule Recurring Jobs

```typescript
// Already registered by default:
// - github.daily.full-sync (2 AM daily)
// - prefetch.hourly.refresh (every hour)
// - prefetch.daily.cleanup (3 AM daily)
// - etl.daily.process (1 AM daily)

// Add custom schedule
service.schedule('custom.job', '*/5 * * * *', async () => {
  await performCustomTask();
});
```

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `BACKGROUND_DATABASE_URL` | MySQL/TiDB connection URL | Required | `mysql://user:pass@host:4000/db` |
| `BACKGROUND_REDIS_URL` | Redis connection URL | Required | `redis://localhost:6379` |
| `BACKGROUND_WORKER_CONCURRENCY` | Number of concurrent workers | `10` | `20` |
| `BACKGROUND_LOG_LEVEL` | Logging level | `info` | `debug` |

### TiDB Cloud Connection

```bash
# Serverless tier
BACKGROUND_DATABASE_URL="mysql://user:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={\"rejectUnauthorized\":true}"

# Note: Replace user/password with your actual credentials
# Serverless user format: xxx.root (with .root suffix)
```

### Local Development

```bash
# MySQL
BACKGROUND_DATABASE_URL="mysql://root@localhost:3306/ossinsight"

# Redis
BACKGROUND_REDIS_URL="redis://localhost:6379"
```

## Available Tasks

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

### ETL

| Task | Data | Description |
|------|------|-------------|
| `etl.process` | `{ pipelineId, source, destination, options? }` | Run ETL pipeline |
| `etl.transform` | `{ transformId, input, output, transformType }` | Transform data |
| `etl.load` | `{ loadId, data, target, mode }` | Load data to target |

**Scheduled:** `etl.daily.process` (1 AM daily)

## Database Schema

The setup script creates these tables:

### orbital_tasks

Main task queue table.

```sql
CREATE TABLE orbital_tasks (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority INT DEFAULT 5,
  created_at DATETIME(3) NOT NULL,
  scheduled_at DATETIME(3) NULL,
  started_at DATETIME(3) NULL,
  completed_at DATETIME(3) NULL,
  max_retries INT DEFAULT 3,
  retry_count INT DEFAULT 0,
  payload JSON NULL,
  error_message TEXT NULL,
  -- ... more fields
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at)
);
```

### orbital_scheduled_jobs

Recurring job definitions.

```sql
CREATE TABLE orbital_scheduled_jobs (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  cron_expression VARCHAR(255) NOT NULL,
  task_type VARCHAR(255) NOT NULL,
  task_data JSON NULL,
  enabled BOOLEAN DEFAULT true,
  last_run_at DATETIME(3) NULL,
  next_run_at DATETIME(3) NULL
);
```

## Monitoring

### Logs

The service uses `pino` for structured logging:

```bash
# Debug mode
BACKGROUND_LOG_LEVEL=debug pnpm start

# Production
BACKGROUND_LOG_LEVEL=info pnpm start
```

### Task Status

```typescript
const status = await service.scheduler.getTaskStatus(jobId);
console.log(status);
// { status: 'completed' | 'running' | 'failed' | 'pending', ... }
```

## Troubleshooting

### Task Not Processing

1. Check if scheduler is running: `background-service status`
2. Check if workers are connected
3. Verify Redis connection: `redis-cli ping`
4. Check logs for errors

### Database Connection Failed

```bash
# Test MySQL/TiDB connection
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u user -p -e "SELECT 1"
```

### Redis Connection Failed

```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Test
redis-cli ping  # Should return: PONG
```

## License

Apache-2.0 © OSS Insight Team
