# @ossinsight/db

Shared **Prisma 7** database client for all OSSInsight packages.

## Overview

This package provides a single, canonical Prisma schema that mirrors every existing
TiDB/MySQL table **without altering any column names or types**.  All other packages
(`api-server`, `cli`, `etl`, `sync-github-data`, …) import their database client from
here instead of managing their own schemas or raw MySQL2 connections.

## Usage

```ts
import { db } from '@ossinsight/db';

// type-safe query
const repos = await db.gitHubRepo.findMany({
  where: { stars: { gte: 1000 } },
  take: 20,
});
```

## Setup

```bash
# Set DATABASE_URL in .env
DATABASE_URL="mysql://user:password@host:4000/ossinsight"

# Generate the Prisma client
npm run generate

# (Optional) push schema changes to the database
npm run db:push
```

## Models

| Prisma Model         | Table                  |
|----------------------|------------------------|
| `GithubEvent`        | `github_events`        |
| `GitHubRepo`         | `github_repos`         |
| `GitHubRepoTopic`    | `github_repo_topics`   |
| `GitHubRepoLanguage` | `github_repo_languages`|
| `GitHubUser`         | `github_users`         |
| `Collection`         | `collections`          |
| `CollectionItem`     | `collection_items`     |
| `ImportLog`          | `import_logs`          |
| `User`               | `users`                |
| `LocationCacheItem`  | `location_cache`       |
