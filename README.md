<h1 align="center">OSSInsight</h1>

<p align="center">
  <b>The analytics engine for the AI-native open source ecosystem.</b><br/>
  Analyze 10+ billion GitHub events. Track AI agents, coding tools, and the repos shaping the future.
</p>

<div align="center">
<a href="https://ossinsight.io">
  <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage.gif"
</a>
</div>

<h4 align="center">
  <b><a href="https://ossinsight.io/explore/">Data Explorer</a></b>
  •
  <b><a href="https://ossinsight.io/collections/ai-agent-frameworks">AI Agent Rankings</a></b>
  •
  <b><a href="https://ossinsight.io/trending">Trending</a></b>
  •
  <a href="https://ossinsight.io/analyze/karpathy/autoresearch">Repo Analytics</a>
  •
  <a href="https://ossinsight.io/analyze-user/torvalds">Developer Analytics</a>
  •
  <a href="https://ossinsight.io/collections/open-source-database">Collections</a>
  •
  <a href="https://ossinsight.io/blog">Blog</a>
  •
  <a href="https://twitter.com/OSSInsight">Twitter</a>
</h4>

## What is OSSInsight?

OSSInsight analyzes **10+ billion rows of GitHub event data** to surface insights about the open source ecosystem — from individual developers to entire technical fields.

In 2026, that means tracking the explosion of **AI agents, coding assistants, research automation, and the infrastructure being built around them**. OSSInsight is how you see what's actually happening in open source, measured in commits, stars, forks, and contributors — not hype.

### For AI builders

- **[AI Agent Frameworks](https://ossinsight.io/collections/ai-agent-frameworks)** — Rankings and trends across LangChain, CrewAI, AutoGen, and 50+ agent frameworks
- **[Coding Agents](https://ossinsight.io/collections/ai-coding-assistant)** — Track Claude Code, Copilot, Cursor, Aider, and the autonomous coding wave
- **[Research Agents](https://ossinsight.io/analyze/karpathy/autoresearch)** — Analyze repos like autoresearch (54K stars in 19 days) that are turning research into search
- **[MCP & Tool Infrastructure](https://ossinsight.io/collections/model-context-protocol)** — The standardizing integration layer for AI agents

### For developers

- **[Developer Analytics](https://ossinsight.io/analyze-user/torvalds)** — Contribution patterns, code review cadence, collaboration networks
- **[Repository Analytics](https://ossinsight.io/analyze/pingcap/tidb)** — Stars, forks, contributor growth, geographic distribution, company breakdown
- **[Compare Projects](https://ossinsight.io/analyze/pytorch/pytorch?vs=tensorflow/tensorflow)** — Side-by-side comparison on any metric
- **[Trending](https://ossinsight.io/trending)** — What's gaining velocity right now

### For researchers & analysts

- **[Data Explorer](https://ossinsight.io/explore/)** — Ask questions about GitHub data in natural language, get SQL + visualizations
- **[60+ Curated Collections](https://ossinsight.io/collections/open-source-database)** — From databases to Web3, from DevOps to AI safety
- **[Blog](https://ossinsight.io/blog)** — Data-driven analysis of open source trends

## LLM-Friendly

OSSInsight is built for the AI era:

- **[`/llms.txt`](https://ossinsight.io/llms.txt)** — Structured site description for LLMs
- **[`/llms-full.txt`](https://ossinsight.io/llms-full.txt)** — Full documentation in LLM-friendly format
- **[OpenSearch](https://ossinsight.io/opensearch.xml)** — Machine-readable search integration
- **Schema.org structured data** on every page — TechArticle, CollectionPage, BreadcrumbList, FAQPage, and more

## Featured Analysis

| Topic | What we found |
|-------|--------------|
| [autoresearch: 54K Stars in 19 Days](https://ossinsight.io/blog/autoresearch-overnight-ai-scientist) | Research is becoming search. karpathy/autoresearch has a 1,085:1 fork-to-contributor ratio — people fork to run private experiments, not to contribute back. |
| [The Coding Agent Wars](https://ossinsight.io/blog/coding-agent-wars-2026) | Claude Code, Codex, OpenCode — the autonomous coding landscape mapped by the data. |
| [Agent Skills: Not the Endgame](https://ossinsight.io/blog/agent-skills-not-endgame) | 57K AGENTS.md repos, 21K CLAUDE.md — skills are a transitional layer, not the final form. |

## Features

### **Data Explorer**
  
Ask questions about GitHub data in natural language — Data Explorer generates SQL, queries the data, and presents results visually.

Examples:
* [Projects similar to @facebook/react](https://ossinsight.io/explore?id=ba186a53-b2ab-4cad-a46f-e2c36566cacd)
* [Where are @kubernetes/kubernetes contributors from?](https://ossinsight.io/explore?id=754a681e-913f-4333-b55d-dbd8598bd84d)
* [More popular questions](https://ossinsight.io/explore/)

### **Collections & Rankings**

Find insights about monthly or historical rankings and trends in technical fields with curated repository lists.

<div align="center">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage-collection.png" alt="GitHub Collections Analytics" height="500" />
</div>

**Examples**:
* [Collection: AI Agent Frameworks](https://ossinsight.io/collections/ai-agent-frameworks)
* [Collection: Open Source Database](https://ossinsight.io/collections/open-source-database)
* [Collection: Web Framework](https://ossinsight.io/collections/web-framework)
* [More](https://ossinsight.io/collections/open-source-database) ...

### **Developer Analytics**

Insights about **developer productivity**, **work cadence**, and **collaboration** from contribution behavior.

* Contribution time distribution, stars, languages, and trends
* Code (commits, pull requests, code line changes), code reviews, and issues

<div align="center">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage-developer.png" alt="Developer Analytics" height="500" />
</div>

### **Repository Analytics**

Insights about **code update frequency & popularity** from repository status.

* Stars, forks, issues, commits, pull requests, contributors, languages, and lines of code
* Geographical and company distribution of stargazers, issue creators, and PR creators

<div align="center">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage-repository.png" alt="Repository Analytics" height="500" />
</div>

**Examples**:
* [React](https://ossinsight.io/analyze/facebook/react)
* [TiDB](https://ossinsight.io/analyze/pingcap/tidb)
* [PyTorch](https://ossinsight.io/analyze/pytorch/pytorch)

### **Compare Projects**

Compare two projects side-by-side on any metric.

**Examples**:
* [Compare Vue and React](https://ossinsight.io/analyze/vuejs/vue?vs=facebook/react)
* [Compare PyTorch and TensorFlow](https://ossinsight.io/analyze/pytorch/pytorch?vs=tensorflow/tensorflow)

## Collections

Curated lists of repos in technical fields, ranked by GitHub metrics. Perfect for tracking ecosystems.

**Add a collection** by submitting a PR to [`etl/meta/collections/`](https://github.com/pingcap/ossinsight/tree/main/etl/meta/collections):

```yml
id: <collection_id>
name: <collection_name>
items:
  - owner/repo-1
  - owner/repo-2
```

**Popular collections:**
[AI Agent Frameworks](https://ossinsight.io/collections/ai-agent-frameworks) •
[Open Source Database](https://ossinsight.io/collections/open-source-database) •
[Web Framework](https://ossinsight.io/collections/web-framework) •
[JavaScript ORM](https://ossinsight.io/collections/javascript-orm) •
[More...](https://ossinsight.io/collections/open-source-database)

## Development

```bash
pnpm install
pnpm dev        # Start web app (port 3001)
pnpm dev:docs   # Start docs site (port 3002)
pnpm dev:all    # Start both
```

## Contributing

- [GitHub Discussions](https://github.com/pingcap/ossinsight/discussions) — Questions, ideas, best practices
- [GitHub Issues](https://github.com/pingcap/ossinsight/issues) — Bugs, features, collection suggestions
- [GitHub PRs](https://github.com/pingcap/ossinsight/pulls) — Code, fixes, blog posts, new collections

## Contact

- [@OSSInsight](https://twitter.com/OSSInsight) on Twitter
- [GitHub Discussions](https://github.com/pingcap/ossinsight/discussions)
- [ossinsight@pingcap.com](mailto:ossinsight@pingcap.com)

<div align="center">
  <sub>Powered by</sub><br/>
  <a href="https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/tidb-cloud-logo-w.png" height=50 />
  </a>
</div>
