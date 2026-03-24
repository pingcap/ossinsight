# @ossinsight/orbital-service

Shared Orbital task scheduler service for OSS Insight.

## Installation

```bash
pnpm add @ossinsight/orbital-service
```

## Quick Start

### Start the Scheduler

```bash
# Using environment variables
export ORBITAL_REDIS_URL=redis://localhost:6379
export ORBITAL_DATABASE_URL=mysql://localhost:3306/ossinsight

# Start the scheduler
orbital-service start
```

### Start a Worker

```bash
orbital-service worker
```

## Programmatic Usage

```typescript
import { getOrbitalService, createOrbitalService } from '@ossinsight/orbital-service';

// Get default service (uses env vars)
const service = getOrbitalService();
await service.start();

// Or create custom instance
const customService = createOrbitalService({
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

| Variable | Description | Default |
|----------|-------------|---------|
| `ORBITAL_REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `ORBITAL_DATABASE_URL` | MySQL/TiDB connection URL | `mysql://localhost:3306/ossinsight` |
| `ORBITAL_WORKER_CONCURRENCY` | Number of concurrent workers | `10` |
| `ORBITAL_LOG_LEVEL` | Logging level | `info` |

## Available Tasks

### GitHub Sync

- `github.sync.user` - Sync user data
- `github.sync.repo` - Sync repository data
- `github.sync.events` - Sync events data

### Query Prefetch

- `prefetch.query` - Pre-execute and cache queries
- `prefetch.cache` - Update cache layers

### ETL

- `etl.process` - Run ETL pipeline
- `etl.transform` - Transform data
- `etl.load` - Load data to target

## Monitoring

The service uses `pino` for logging. Set `ORBITAL_LOG_LEVEL` to control verbosity:

```bash
# Debug mode
ORBITAL_LOG_LEVEL=debug orbital-service start

# Production
ORBITAL_LOG_LEVEL=info orbital-service start
```

## License

Apache-2.0 © OSS Insight Team
