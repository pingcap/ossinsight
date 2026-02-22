# @ossinsight/etl

**Node.js ETL replacing the legacy Ruby ETL.**  
Imports hourly GitHub Archive (`.json.gz`) files into TiDB.

## Overview

This package is a direct replacement for `etl/` (Ruby on Rails + ActiveRecord).  
It uses:

- **TypeScript** for type safety
- **Prisma 7** via `@ossinsight/db` for schema definitions
- **mysql2** for high-throughput bulk inserts
- **Commander** for the CLI
- **Vitest** for unit tests

## Usage

```bash
# Set environment variable
export DATABASE_URL="mysql://user:pass@host:4000/ossinsight"

# Import the previous hour
ossinsight-etl import hourly

# Import a specific date/hour
ossinsight-etl import hourly --date 2024-01-15 --hour 12

# Import a date range
ossinsight-etl import range --from 2024-01-01 --to 2024-01-31
```

## Development

```bash
# Install deps
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## Architecture

```
src/
├── index.ts              # CLI entry point (Commander program)
├── commands/
│   └── import.ts         # `hourly` and `range` sub-commands
├── importers/
│   ├── gharchive.ts      # Stream-based JSON parser for GH Archive files
│   └── db-writer.ts      # Bulk insert / delete helpers (mysql2)
├── models/
│   └── github-event.ts   # TypeScript interfaces for raw & normalised events
└── utils/
    ├── downloader.ts      # HTTP download helper
    └── logger.ts          # pino logger singleton
```
