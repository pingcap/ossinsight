import type { Metadata } from 'next';
import { getCollectionRanking } from '@/lib/server/internal-api';
import { BreadcrumbListJsonLd, FAQPageJsonLd, ItemListJsonLd } from '@/components/json-ld';
import { TrendingAIContent } from './content';
import type { AIRepoItem, TrendingAIResponse } from './api/route';

export const revalidate = 3600;

const TITLE = 'Trending AI Repositories on GitHub — Real-Time Rankings 2026 | OSSInsight';
const DESCRIPTION =
  'Discover the top trending AI repositories on GitHub in 2026. Real-time rankings of AI agent frameworks, LLM tools, MCP servers, coding agents, RAG frameworks, and more — powered by 10B+ GitHub events.';

const AI_COLLECTIONS = [
  { id: 10098, category: 'AI Agents' },
  { id: 10076, category: 'LLM Tools' },
  { id: 10105, category: 'MCP Servers' },
  { id: 10106, category: 'Coding Agents' },
  { id: 10108, category: 'RAG' },
  { id: 10109, category: 'Inference' },
  { id: 10077, category: 'Vector DB' },
  { id: 10107, category: 'Vibe Coding' },
  { id: 10112, category: 'AI Assistants' },
] as const;

const FAQ_ITEMS = [
  {
    question: 'What are the most popular AI repositories on GitHub in 2026?',
    answer:
      'The most popular AI repositories on GitHub span categories like AI agent frameworks (e.g., LangChain, AutoGPT), LLM tools, MCP servers, coding agents, and more. OSSInsight tracks real-time star growth and contributor activity across 10B+ GitHub events to rank these projects.',
  },
  {
    question: 'How are trending AI repos ranked on this page?',
    answer:
      'Repos are ranked by total GitHub stars, with growth metrics calculated from the last 28 days of activity. Data is sourced from multiple curated collections covering AI agents, LLM tools, RAG frameworks, inference engines, and related categories.',
  },
  {
    question: 'What is an MCP server and why are they trending?',
    answer:
      'MCP (Model Context Protocol) servers enable AI models to interact with external tools and data sources. They are trending because they allow LLMs to access real-time information, execute code, and interact with APIs, making AI applications more capable and practical.',
  },
  {
    question: 'How often is the trending AI repos data updated?',
    answer:
      'The data is refreshed every hour using real-time GitHub event data. OSSInsight processes over 10 billion GitHub events to provide up-to-date rankings of stars, pull requests, issues, and contributor activity.',
  },
  {
    question: 'Can I analyze a specific AI repository in more detail?',
    answer:
      'Yes! Click on any repository name to visit its detailed analytics page on OSSInsight, where you can explore star history, commit activity, contributor growth, pull request trends, and more.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    keywords:
      'github trending ai repos, top ai github projects 2026, ai agent frameworks, llm tools github, mcp servers, coding agents, rag frameworks, ai coding assistants, vibe coding, vector database github',
    alternates: { canonical: '/trending/ai' },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: '/trending/ai',
      type: 'website',
    },
    twitter: {
      title: TITLE,
      description: DESCRIPTION,
      card: 'summary_large_image',
    },
  };
}

async function fetchAllAIRepos(): Promise<TrendingAIResponse> {
  try {
    const results = await Promise.allSettled(
      AI_COLLECTIONS.map((c) => getCollectionRanking(c.id, 'stars', 'last-28-days')),
    );

    const seen = new Map<string, AIRepoItem>();

    results.forEach((result, idx) => {
      if (result.status !== 'fulfilled' || !result.value?.data) return;
      const { category, id } = AI_COLLECTIONS[idx];
      for (const row of result.value.data as any[]) {
        const existing = seen.get(row.repo_name);
        if (!existing || row.total > existing.total) {
          seen.set(row.repo_name, {
            repo_id: row.repo_id,
            repo_name: row.repo_name,
            total: row.total ?? 0,
            last_period_total: row.last_period_total,
            last_period_rank: row.last_period_rank,
            growth: row.last_period_total ?? 0,
            category,
            collection_id: id,
          });
        }
      }
    });

    const repos = Array.from(seen.values()).sort((a, b) => b.total - a.total).slice(0, 50);

    const categories = AI_COLLECTIONS.map((c, idx) => {
      const r = results[idx];
      const data = r.status === 'fulfilled' && r.value?.data ? (r.value.data as any[]) : [];
      return {
        id: c.id,
        category: c.category,
        count: data.length,
        topRepo: data[0]?.repo_name ?? '',
      };
    });

    return { repos, categories };
  } catch (error) {
    console.warn('[trending/ai] Failed to pre-fetch data:', error);
    return { repos: [], categories: [] };
  }
}

const SITE_URL = process.env.SITE_URL || 'https://ossinsight.io';

export default async function TrendingAIPage() {
  const data = await fetchAllAIRepos();

  const topReposForJsonLd = data.repos.slice(0, 10).map((r) => ({
    name: r.repo_name,
    url: `${SITE_URL}/analyze/${r.repo_name}`,
  }));

  return (
    <>
      <ItemListJsonLd name="Trending AI Repositories on GitHub 2026" items={topReposForJsonLd} />
      <FAQPageJsonLd items={FAQ_ITEMS} />
      <BreadcrumbListJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Trending', url: '/trending' },
          { name: 'AI Repositories' },
        ]}
      />
      <div className="sr-only">
        <h1>Trending AI Repositories on GitHub — Real-Time Rankings 2026</h1>
        <p>
          Discover the top trending AI repositories on GitHub. This page ranks AI agent frameworks,
          LLM tools, MCP servers, coding agents, RAG frameworks, inference engines, vector databases,
          vibe coding tools, and AI coding assistants by GitHub stars and recent growth.
          Powered by OSSInsight&apos;s analysis of over 10 billion GitHub events.
        </p>
      </div>
      <TrendingAIContent initialData={data} faqItems={FAQ_ITEMS} />
    </>
  );
}
