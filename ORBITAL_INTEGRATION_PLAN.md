# Orbital Integration Plan for OSS Insight

**Status:** In Progress  
**Date:** March 24, 2026  
**Package:** `@mini256/orbital@0.1.0`

---

## 🎯 Goals

Replace existing scheduling infrastructure with Orbital as the unified background task framework for:

1. **ETL Pipelines** - Data processing workflows
2. **GitHub Sync** - User/repository synchronization
3. **Query Prefetch** - Intelligent query caching
4. **Data Pipelines** - General data processing tasks

---

## 📦 Current State

### Existing Packages

| Package | Current Scheduler | Status |
|---------|------------------|--------|
| `@ossinsight/pipeline` | `node-schedule`, `croner`, `toad-scheduler` | Needs migration |
| `@ossinsight/prefetch` | Custom scheduling | Needs migration |
| `@ossinsight/sync-github-data` | Custom scheduling | Needs migration |
| `@ossinsight/api-server` | None (API only) | Add task triggers |

### Infrastructure

- **Redis:** Available for task queue
- **TiDB:** Available for task persistence
- **Node.js:** >= 20.9.0 (compatible with Orbital)

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────┐
│   OSS Insight   │────▶│   Orbital   │
│   (Web/API)     │     │   Scheduler │
└─────────────────┘     └──────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
             ┌──────▼───┐ ┌────▼────┐ ┌──▼──────┐
             │  GitHub  │ │ Prefetch│ │  ETL    │
             │  Sync    │ │ Worker  │ │ Pipeline│
             └──────────┘ └─────────┘ └─────────┘
```

---

## 📋 Migration Tasks

### Phase 1: Core Integration

- [ ] Add `@mini256/orbital` to all packages
- [ ] Create shared Orbital configuration
- [ ] Set up Redis connection
- [ ] Set up TiDB connection for persistence

### Phase 2: Task Definitions

- [ ] **GitHub Sync Tasks**
  - `github.sync.user` - Sync user data
  - `github.sync.repo` - Sync repository data
  - `github.sync.events` - Sync events data

- [ ] **Prefetch Tasks**
  - `prefetch.query` - Pre-execute common queries
  - `prefetch.cache` - Update cache layers

- [ ] **ETL Tasks**
  - `etl.process` - General data processing
  - `etl.transform` - Data transformation
  - `etl.load` - Data loading

### Phase 3: Worker Setup

- [ ] Create worker processes for each task type
- [ ] Configure worker concurrency
- [ ] Set up health checks
- [ ] Add monitoring/metrics

### Phase 4: Migration

- [ ] Migrate existing cron jobs to Orbital schedules
- [ ] Test all task types
- [ ] Deploy workers
- [ ] Monitor and iterate

---

## 🔧 Configuration

### Environment Variables

```bash
# Orbital Configuration
ORBITAL_REDIS_URL=redis://localhost:6379
ORBITAL_DATABASE_URL=mysql://localhost:3306/ossinsight_orbital
ORBITAL_WORKER_CONCURRENCY=10
ORBITAL_LOG_LEVEL=info
```

### Task Queue Setup

```typescript
import { Orbital } from '@mini256/orbital';

const orbital = new Orbital({
  redis: process.env.ORBITAL_REDIS_URL,
  database: process.env.ORBITAL_DATABASE_URL,
});

// Define tasks
orbital.define('github.sync.user', async (job) => {
  const { userId } = job.data;
  await syncUserData(userId);
});

orbital.define('github.sync.repo', async (job) => {
  const { repoId } = job.data;
  await syncRepoData(repoId);
});

// Schedule recurring jobs
orbital.schedule('github.daily.full-sync', '0 2 * * *', async () => {
  await performFullSync();
});
```

---

## 📊 Benefits

| Before | After |
|--------|-------|
| Multiple scheduling libraries | Single unified framework |
| No task persistence | Redis + TiDB dual-write |
| Limited observability | Prometheus metrics built-in |
| No distributed support | Multi-worker cluster ready |
| Manual retry logic | Built-in retry with backoff |

---

## 🚀 Rollout Plan

1. **Week 1:** Core integration + GitHub Sync tasks
2. **Week 2:** Prefetch + ETL tasks
3. **Week 3:** Testing + monitoring
4. **Week 4:** Production rollout

---

## 📝 Next Steps

1. ✅ Install `@mini256/orbital` in monorepo
2. ⏳ Create shared Orbital service module
3. ⏳ Migrate `@ossinsight/pipeline` to use Orbital
4. ⏳ Migrate `@ossinsight/prefetch` to use Orbital
5. ⏳ Migrate `@ossinsight/sync-github-data` to use Orbital
6. ⏳ Deploy worker processes
7. ⏳ Monitor and optimize

---

**Owner:** @mini256  
**Reviewers:** OSS Insight Team
