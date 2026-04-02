# Contributing to OSSInsight

We welcome contributions! Whether it's adding a collection, fixing a bug, or improving the site, this guide will help you get started.

## Project Structure

OSSInsight is a **pnpm + Turborepo monorepo**:

```
├── apps/
│   ├── web/          # Next.js App Router — the main website (deployed on Vercel)
│   └── docs/         # Documentation site
├── packages/         # Shared libraries (types, config, site-shell, etc.)
├── configs/
│   └── collections/  # Collection YAML configs
├── etl/              # Data pipeline
└── scripts/          # Utility scripts (verify, sync, load collections)
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.9.0
- **pnpm** (see `packageManager` in `package.json` for the exact version)

### Local Development

```bash
# Install dependencies
pnpm install

# Start the web app (default: http://localhost:3001)
pnpm dev

# Or start a specific app
pnpm dev:web
pnpm dev:docs
```

### Build & Lint

```bash
pnpm build         # Build all packages
pnpm lint          # Lint all packages
pnpm check-types   # Type-check all packages
```

## Add a Collection

Collections are YAML files in [`configs/collections/`](https://github.com/pingcap/ossinsight/tree/main/configs/collections).

### Steps

1. Find the latest collection ID in `configs/collections/` and use the next number.
2. Create a new file: `configs/collections/<id>.<collection-name>.yml`
3. Use this format:

```yaml
id: <collection_id>
name: <Collection Name>
items:
  - owner/repo-1
  - owner/repo-2
```

**Example:** `10142.my-collection.yml`

```yaml
id: 10142
name: My Collection
items:
  - facebook/react
  - vuejs/vue
```

### Validation

A CI workflow automatically verifies collection configs on every PR:

```bash
# Run locally before submitting
node scripts/verify-collection.mjs --fix-suggestions
```

This checks YAML format, ID uniqueness, and whether repos exist on GitHub.

### Sync

After merging to `main`, the `sync-collection-configs.yml` workflow automatically syncs collections to the database via `scripts/load-collection.mjs`.

## Pull Requests

### PR Title Format

Use a scoped prefix:

```
<scope>: description of change
```

| Scope | When to use |
|-------|-------------|
| `config` | Collection changes |
| `web` | Website (apps/web) changes |
| `docs` | Documentation changes |
| `etl` | Data pipeline changes |
| `scripts` | Utility script changes |
| `ci` | GitHub Actions / workflow changes |

**Examples:**
- `config: add AI code editor collection`
- `web: fix compare page chart rendering`
- `ci: add Node 22 to test matrix`

### Guidelines

- One PR per logical change.
- Make sure `pnpm lint` and `pnpm check-types` pass.
- For collection PRs, run `node scripts/verify-collection.mjs` locally first.

## Issues

### Bug Reports

Use [GitHub Issues](https://github.com/pingcap/ossinsight/issues/new/choose) to report bugs:

- **One issue, one bug.**
- Include steps to reproduce.
- Include browser/OS info for frontend bugs.

### Feature Requests

Open a [feature request](https://github.com/pingcap/ossinsight/issues/new) describing what you'd like and why.

## Questions?

- Open a [GitHub Discussion](https://github.com/pingcap/ossinsight/discussions)
- Find us on Twitter: [@OSSInsight](https://twitter.com/OSSInsight)
