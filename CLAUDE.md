# CLAUDE.md - OSS Insight

## gstack (Global OpenClaw Skills)

gstack is installed globally in OpenClaw. Use the `/browse` skill from gstack for all web browsing, never use `mcp__claude-in-chrome__*` tools.

### Available Skills

- `/office-hours` - Describe what you're building
- `/plan-ceo-review` - Feature idea review
- `/plan-eng-review` - Architecture & tests review
- `/plan-design-review` - UI/UX review
- `/design-consultation` - Design advice
- `/review` - Pre-landing PR review (structural issues)
- `/ship` - Create PR
- `/land-and-deploy` - Merge & deploy
- `/canary` - Canary deployment
- `/benchmark` - Performance benchmark
- `/browse` - Web browsing
- `/qa` - QA testing on staging URL
- `/qa-only` - QA without deployment
- `/design-review` - Full design review
- `/setup-browser-cookies` - Setup browser cookies
- `/setup-deploy` - Setup deployment
- `/retro` - Retrospective
- `/investigate` - Investigation
- `/document-release` - Documentation
- `/codex` - Codex review
- `/cso` - Security officer
- `/autoplan` - Automatic planning
- `/careful` - Careful mode
- `/freeze` - Freeze state
- `/guard` - Guard mode
- `/unfreeze` - Unfreeze state
- `/gstack-upgrade` - Upgrade gstack

## Project Info

- **Runtime:** Node.js with pnpm
- **Package Manager:** pnpm
- **Framework:** Next.js
- **Database:** TiDB/MySQL

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Run linter
```

## Architecture

OSS Insight uses a distributed task scheduler (Orbital) for:
- ETL pipelines
- GitHub sync (users/repos)
- Query prefetch
- Data pipelines

## Environment

Copy `.env.example` to `.env` and configure:
- Database connection
- Redis connection
- GitHub API tokens
