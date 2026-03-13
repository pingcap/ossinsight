---
title: "Rebuilding OSSInsight: From Docusaurus to Next.js, Powered by AI"
date: 2026-03-13
authors: [claudecode]
tags: [engineering, ai, seo]
description: "How we migrated OSSInsight from a Docusaurus SPA to a Next.js App Router monorepo — and used Claude Code to ship 30+ SEO, SSR, and UX improvements in a single afternoon."
image: /blog-assets/ai-powered-seo-and-ux-improvements-2026/cover.png
keywords: [ai, claude code, next.js, docusaurus, migration, seo, ssr]
---

We want OSSInsight to do more — deeper analysis, AI-agent integrations, new data dimensions. But the old codebase was holding us back. So we rebuilt it.

The original OSSInsight was a patchwork of systems grown over time: a **Docusaurus 2 frontend** (React 17, Material UI, client-side only), a separate **Fastify API server** handling hundreds of SQL query endpoints, a **Next.js widget platform** for embeddable charts, plus standalone services for job queues, data pipelines, and GitHub event syncing. Each piece had its own repo, its own deploy, its own patterns.

Adding a feature meant touching three systems. Fixing a bug meant understanding which layer owned it. And SEO? Forget it — everything was client-rendered.

The new OSSInsight consolidates all of this into a single **Turborepo monorepo**: one Next.js App Router app for the main site, one Fumadocs app for documentation, and shared packages for the header/nav shell. The API layer is now Next.js Route Handlers — no separate server. The widget system is integrated directly. One codebase, one deploy, one mental model.

| | Before | After |
|---|---|---|
| Frontend | Docusaurus 2 (React 17, MUI) | Next.js 16 App Router (React 18/19, Tailwind) |
| API | Separate Fastify server | Next.js Route Handlers |
| Widgets | Separate Next.js app | Integrated into main app |
| Docs | Docusaurus plugins | Fumadocs |
| Pipelines | Standalone services | Shared monorepo packages |
| Rendering | Client-only | SSR/SSG hybrid |
| Monorepo | Multiple repos | Turborepo + pnpm |

This consolidation is the foundation for everything we want to build next. And the final round of polish — 30+ improvements across SEO, SSR, bug fixes, and UI — was done entirely with Claude Code in one sitting.

## Where AI came in

The architecture migration was done by the team over months. But the **last-mile polish** — the kind of cross-cutting work that touches dozens of files and requires holding the whole system in your head — that's where Claude Code shone.

In one conversation, the developer described problems and the AI executed:

**"Is the current rendering SEO-friendly?"** — The AI explored the codebase, identified that collection rankings and analyze pages were invisible to crawlers, and proposed a prioritized plan: dynamic `generateMetadata()`, sr-only content, JSON-LD structured data, and SSR for collection tables via React Query's `initialData`.

**"The grid lines are uneven"** — A screenshot and one sentence. The AI traced the issue to ECharts' auto `splitNumber`, found all 7 affected chart files, and fixed them in parallel using sub-agents.

**"Make the left panel look like the right"** — The AI understood the rendering pipeline (`react` vs `react-svg` chart types), converted the component type, added `CardHeading`, and matched the card styling — all from a visual description.

**"The repo selector crashes"** — The AI read the API response, spotted the tuple-vs-object mismatch, and fixed the destructuring. Then caught a second bug: Radix Popover's `onOpenChange` doesn't reliably fire for programmatic closes. Fixed with a direct callback + ref guard.

None of these required the developer to read code, trace bugs, or write diffs. They described outcomes; the AI navigated the codebase and shipped the solutions.

## What the new architecture enables

The migration wasn't just a framework swap. It unlocked capabilities that were impossible before:

**Real SSR for data pages.** Collection rankings now pre-render the default tab on the server. Crawlers index the full table. Users see instant content with zero loading flash. This was a one-line React Query change (`initialData`) — but it required server-side data fetching that Docusaurus simply couldn't do.

**Dynamic metadata at scale.** Each of the thousands of analyze pages now generates its own meta description from the database: `"pingcap/tidb · 38,000 stars · 5,800 forks · Go."` In Docusaurus, we'd have needed a build-time plugin to pre-generate these.

**JSON-LD without plugins.** Adding `BreadcrumbList` structured data was just a React component. No plugin API, no config file, no build step.

**Shared components across apps.** The `site-shell` package gives both the web app and docs site the same header, nav, and search — with independent deployment and versioning.

## Lessons from AI-assisted migration

**AI is best at cross-cutting changes.** Updating 7 chart files with the same fix, ensuring layout consistency across org and repo analyze pages, adding structured data to every page type — these are tedious for humans but trivial for an AI that can hold the whole codebase in context.

**Describe the problem, not the solution.** The most productive interactions started with "why does this look wrong?" rather than "change line 42." The AI often found better solutions than what a human would have prescribed.

**Visual feedback loops matter.** The developer ran the dev server locally and gave instant feedback. "The margins don't match." "The URL didn't update." This tight loop — human eyes + AI hands — was faster than either working alone.

**AI can't replace architectural decisions.** Choosing Next.js over Remix, Turborepo over Nx, Fumadocs over Nextra — these are judgment calls that require understanding the team, the product roadmap, and the ecosystem. AI executed within the architecture; it didn't design it.

## What's next

The migration is ongoing. The Data Explorer's AI question flow, widget thumbnail generation, and some legacy blog content are still being ported. But the core platform — analyze pages, collections, charts, SEO infrastructure — is running on the new stack and serving production traffic.

This rebuild isn't the finish line — it's the starting point. With AI and agents reshaping how developers discover, evaluate, and adopt open source, OSSInsight is uniquely positioned to serve this new ecosystem. Here's where we're headed:

**Structured data for AI agents.** We already added `llms.txt` and JSON-LD. But the real opportunity is turning OSSInsight into a **first-class data source for AI agents**. Imagine an agent that's evaluating which database to adopt — it could query OSSInsight's API for contributor trends, issue response times, and release cadence, then make a data-driven recommendation. We want to build agent-friendly endpoints that return structured, contextual data — not just HTML pages.

**AI-generated code tracking.** As Copilot, Cursor, and Claude Code reshape how code gets written, a natural question emerges: what percentage of commits in a project are AI-assisted? How does AI adoption correlate with contributor growth or code churn? We're exploring ways to surface these signals from commit patterns and PR metadata.

**MCP server for open source intelligence.** We're planning to expose OSSInsight as an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server — so any AI agent or coding assistant can natively query repo stats, community health, and ecosystem trends as part of its reasoning. "What's the most active Rust web framework this quarter?" shouldn't require a browser — it should be a tool call.

**Agent-driven exploration.** The Data Explorer already supports natural language queries. The next step is letting AI agents chain multiple queries together autonomously — compare two projects, correlate trends across ecosystems, and generate narrative reports. Not just answering one question, but conducting research.

**Benchmarking AI's impact on open source.** We sit on one of the largest GitHub event datasets in the world. We want to use it to answer the macro questions: Is AI making open source healthier? Are projects shipping faster? Are new contributors staying longer? OSSInsight can be the neutral, data-driven voice in this conversation.

The takeaway from this migration: **build the architecture with your team, then let AI handle the long tail.** The 30+ improvements shipped in that one Claude Code session would have taken days of context-switching. Instead, it took an afternoon of conversation.

We're building OSSInsight for a world where AI agents are first-class users of open source data. Stay tuned.
