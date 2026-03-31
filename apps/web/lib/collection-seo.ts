/**
 * Dynamic SEO descriptions for collection pages.
 * Each collection gets a unique, keyword-rich meta description (150-160 chars)
 * optimized for search engines.
 */

const COLLECTION_SEO_MAP: Record<string, string> = {
  'AI Agent Frameworks': 'Compare top AI agent frameworks on GitHub — LangChain, CrewAI, AutoGen & more. Real-time rankings by stars, PRs, and contributors. Updated daily.',
  'LLM Tools': 'Discover the best LLM tools and libraries on GitHub. Rankings of top large language model frameworks, SDKs, and utilities by stars and activity.',
  'LLM DevTools': 'Top LLM developer tools on GitHub — prompt engineering, fine-tuning, evaluation & deployment. Ranked by stars, PRs, and community activity.',
  'ChatGPT Apps': 'Best ChatGPT applications and integrations on GitHub. Ranked by popularity, pull requests, and developer activity. Updated in real-time.',
  'ChatGPT Alternatives': 'Top open source ChatGPT alternatives on GitHub. Compare AI chatbots by stars, contributors, and development activity. Find the best fit.',
  'Artificial Intelligence': 'Top AI and machine learning repositories on GitHub. Rankings of artificial intelligence projects by stars, PRs, issues, and contributors.',
  'Model Context Protocol (MCP) Client': 'Best MCP client implementations on GitHub. Compare Model Context Protocol projects by stars, activity, and community engagement.',
  'AI Training Observability': 'Best AI training observability and monitoring tools on GitHub. Track model training, experiments, and ML pipelines. Ranked by activity.',
  'MLOps Tools': 'Top MLOps tools and platforms on GitHub. Compare ML pipeline, model serving, and experiment tracking projects by stars and activity.',
  'ML in Rust': 'Best machine learning libraries written in Rust on GitHub. Performance-focused ML frameworks ranked by stars, PRs, and contributors.',
  'Open Source Database': 'Top open source databases on GitHub — PostgreSQL, MySQL, SQLite alternatives & more. Ranked by stars, PRs, and community activity.',
  'Web Framework': 'Best web frameworks on GitHub — Next.js, Django, Rails & more. Compare by stars, pull requests, and developer activity. Updated daily.',
  'Javascript Framework': 'Top JavaScript frameworks on GitHub — React, Vue, Angular, Svelte & more. Rankings by stars, PRs, issues, and contributor activity.',
  'React Framework': 'Best React frameworks and meta-frameworks on GitHub — Next.js, Remix, Gatsby & more. Ranked by stars and developer activity.',
  'CSS Framework': 'Top CSS frameworks on GitHub — Tailwind CSS, Bootstrap, Bulma & more. Compare by stars, pull requests, and community engagement.',
  'Static Site Generator': 'Best static site generators on GitHub — Hugo, Gatsby, Astro, Jekyll & more. Compare by stars, PRs, and contributor trends.',
  'Game Engine': 'Top open source game engines on GitHub — Godot, Bevy, Panda3D & more. Rankings by stars, pull requests, and community activity.',
  'Programming Language': 'Top programming languages on GitHub — Rust, Go, Zig, Carbon & more. Compare language projects by stars, contributors, and activity.',
  'Text Editor': 'Best open source text editors on GitHub — VS Code, Neovim, Zed & more. Ranked by stars, pull requests, and developer engagement.',
  'Graph Database': 'Top graph databases on GitHub — Neo4j, DGraph, JanusGraph & more. Compare by stars, pull requests, and development activity.',
  'Testing Tools': 'Best testing tools and frameworks on GitHub. Compare unit testing, E2E, and CI testing projects ranked by stars and community activity.',
  'Terminal': 'Top terminal emulators and CLI tools on GitHub — Warp, Alacritty, WezTerm & more. Ranked by stars, PRs, and developer adoption.',
  'Low Code Development Tool': 'Best low-code and no-code platforms on GitHub. Compare development tools by stars, PRs, and contributor engagement.',
  'Security Tool': 'Top open source security tools on GitHub. Compare vulnerability scanners, SIEM, and security frameworks by stars and activity.',
  'UI Framework and UIkit': 'Best UI component libraries and frameworks on GitHub — shadcn/ui, Ant Design, MUI & more. Ranked by stars and development activity.',
  'CICD': 'Best CI/CD tools on GitHub — GitHub Actions, Drone, Woodpecker & more. Compare continuous integration platforms by stars and activity.',
  'Search Engine': 'Top open source search engines on GitHub — Meilisearch, Typesense, Elasticsearch alternatives. Ranked by stars and developer activity.',
  'Business Intelligence': 'Best open source BI tools on GitHub — Metabase, Superset, Redash & more. Compare analytics platforms by stars and community activity.',
  'Kubernetes Tooling': 'Top Kubernetes tools on GitHub. Compare K8s dashboards, operators, and management tools ranked by stars, PRs, and contributors.',
  'TUI Framework': 'Best terminal UI frameworks on GitHub — Ratatui, Bubble Tea, Textual & more. Compare TUI libraries by stars and development activity.',
  'Headless CMS': 'Top headless CMS platforms on GitHub — Strapi, Payload, Directus & more. Compare content management systems by stars and activity.',
};

/**
 * Returns a unique, SEO-optimized meta description for a collection page.
 */
export function getCollectionSeoDescription(collectionName: string): string {
  const known = COLLECTION_SEO_MAP[collectionName];
  if (known) return known;

  // Smart fallback: generate a keyword-rich description from the collection name
  return `Top ${collectionName} repositories on GitHub — ranked by stars, pull requests, issues & contributors. Compare trending projects and track growth over time.`;
}

/**
 * Returns an SEO-optimized page title for a collection page.
 */
export function getCollectionSeoTitle(collectionName: string): string {
  return `${collectionName} — Top GitHub Repositories & Rankings 2026`;
}
