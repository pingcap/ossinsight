# @ossinsight/core

**The single source-of-truth for OSSInsight's shared database schema and core utilities.**

All other packages in this monorepo should depend on `@ossinsight/core` instead of:
- maintaining their own `prisma/schema.prisma` files
- creating their own `PrismaClient` instances
- duplicating the pino logger setup

## What's in here

| Export | Purpose |
|--------|---------|
| `db` | Singleton `PrismaClient` for the process |
| `PrismaClient`, `Prisma`, model types | Re-exported from `@prisma/client` |
| `logger` | Shared pino logger |
| `baseEnvSchema` / `BaseEnvConfig` | JSON-schema env descriptor (extend in each package) |

## Prisma schema

`prisma/schema.prisma` is **the one canonical schema** for the entire monorepo. It maps every
existing TiDB/MySQL table without altering column names.

| Model | Table |
|-------|-------|
| `GithubEvent` | `github_events` |
| `GitHubRepo` | `github_repos` |
| `GitHubRepoTopic` | `github_repo_topics` |
| `GitHubRepoLanguage` | `github_repo_languages` |
| `GitHubUser` | `github_users` |
| `Collection` | `collections` |
| `CollectionItem` | `collection_items` |
| `ImportLog` | `import_logs` |
| `User` | `users` |
| `LocationCacheItem` | `location_cache` |

## Usage

```ts
import { db, logger, baseEnvSchema } from '@ossinsight/core';

const repos = await db.gitHubRepo.findMany({ take: 10 });
logger.info('found %d repos', repos.length);
```

## Setup

```bash
# From repo root
pnpm install

# Generate the Prisma client (run once after schema changes)
cd packages/core && pnpm run generate
```
