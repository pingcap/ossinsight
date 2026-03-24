# AGENTS.md - OSS Insight

**Project:** OSS Insight - GitHub Analytics Platform  
**Model:** Qwen (bailian/qwen3.5-plus)  
**Runtime:** OpenClaw with AgentSkills

---

## 🧠 Session Startup

Before doing anything:

1. Read this `AGENTS.md` — project context
2. Read `ORBITAL_INTEGRATION_PLAN.md` — current integration status
3. Check `packages/orbital-service/` — task scheduler implementation

---

## 🛠️ Available Skills (OpenClaw AgentSkills)

These skills are available via OpenClaw runtime:

### Built-in Skills

| Skill | Description | When to Use |
|-------|-------------|-------------|
| `coding-agent` | Delegate coding to Codex/Claude Code/Pi | Building features, PR reviews, refactoring |
| `weather` | Get weather via wttr.in | User asks about weather |
| `healthcheck` | Security audit & hardening | Security reviews, exposure checks |
| `node-connect` | Diagnose node connection | Android/iOS/macOS app pairing issues |
| `skill-creator` | Create/edit AgentSkills | Building new skills |
| `tmux` | Remote-control tmux | Interactive CLI sessions |

### gstack Skills (Global)

gstack is installed globally in OpenClaw at:
`~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/gstack`

| Skill | Description |
|-------|-------------|
| `/review` | Pre-landing PR review |
| `/ship` | Create PR |
| `/qa` | QA testing |
| `/browse` | Web browsing |
| `/plan-ceo-review` | Strategy review |
| `/plan-eng-review` | Architecture review |
| `/cso` | Security review |
| `/codex` | Codex review |
| ...and 20+ more |

### Using Skills

Skills are auto-loaded by OpenClaw. Just describe what you need:

```
# Example: Coding task
"Use coding-agent to build a new API endpoint"

# Example: Security check  
"Run healthcheck on the deployment"

# Example: gstack skill
"Run /review on the current branch"
```

---

## 📦 Project Structure

```
ossinsight/
├── apps/
│   ├── web/           # Next.js web app
│   └── docs/          # Documentation site
├── packages/
│   ├── orbital-service/  # ⭐ NEW: Task scheduler
│   ├── pipeline/         # Data pipelines (migrate to Orbital)
│   ├── prefetch/         # Query prefetch (migrate to Orbital)
│   ├── sync-github-data/ # GitHub sync (migrate to Orbital)
│   ├── api-server/       # API layer
│   └── types/            # Shared types
├── etl/             # ETL scripts
└── configs/         # Collection configs
```

---

## 🛰️ Orbital Integration

**Status:** In Progress  
**Package:** `@ossinsight/orbital-service`

### Current Tasks

| Task Type | Status | Owner |
|-----------|--------|-------|
| GitHub Sync | Stub implemented | Pending |
| Query Prefetch | Stub implemented | Pending |
| ETL Pipeline | Stub implemented | Pending |

### Next Steps

1. Implement actual task handlers (replace stubs)
2. Migrate existing `node-schedule` jobs to Orbital
3. Deploy worker processes
4. Add monitoring/metrics

See `ORBITAL_INTEGRATION_PLAN.md` for details.

---

## 🔧 Development Commands

```bash
# Monorepo
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm dev              # Start dev server (web)

# Orbital Service
cd packages/orbital-service
pnpm build            # Build TypeScript
pnpm start            # Start scheduler
pnpm worker           # Start worker

# Testing
pnpm test             # Run tests
pnpm lint             # Run linter
```

---

## 🌐 Environment

### Required Services

| Service | Default URL | Purpose |
|---------|-------------|---------|
| Redis | `redis://localhost:6379` | Task queue (Orbital) |
| TiDB/MySQL | `mysql://localhost:3306/ossinsight` | Data storage |

### Orbital Environment Variables

```bash
ORBITAL_REDIS_URL=redis://localhost:6379
ORBITAL_DATABASE_URL=mysql://localhost:3306/ossinsight
ORBITAL_WORKER_CONCURRENCY=10
ORBITAL_LOG_LEVEL=info
```

---

## 📝 Code Style

- **TypeScript:** Strict mode, ES2022 target
- **Module:** ESNext with bundler resolution
- **Formatting:** oxfmt (via Vite+)
- **Linting:** oxlint
- **Testing:** vitest

### Naming Conventions

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

---

## 🚀 Deployment

### Worker Deployment

```bash
# Start scheduler (single instance)
orbital-service start

# Start workers (multiple instances)
orbital-service worker  # Run on each worker node
```

### Monitoring

- Logs: Pino (structured JSON)
- Metrics: Prometheus (via Orbital)
- Health: Check worker heartbeats

---

## 🤝 Contributing

1. Create branch from `main`
2. Implement changes
3. Run `/review` before committing
4. Commit with conventional commits
5. Push and create PR

### Commit Format

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: code refactoring
test: add/update tests
chore: maintenance tasks
```

---

## 📚 Documentation

- **Main Docs:** `apps/docs/`
- **API Reference:** Auto-generated from TypeScript
- **Architecture:** `docs/` directory
- **Integration Plan:** `ORBITAL_INTEGRATION_PLAN.md`

---

## 🆘 Getting Help

1. Check existing docs first
2. Search codebase for examples
3. Ask in OSS Insight Discord
4. File GitHub issue if blocked

---

**Last Updated:** March 24, 2026  
**Maintained By:** OSS Insight Team
