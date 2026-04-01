import { runQuery } from '@/lib/data-service/routes';
import { cache } from 'react';

// Core AI categories tracked
export const AI_CATEGORIES = [
  { id: 10098, name: 'AI Agents', slug: 'ai-agent-frameworks', emoji: '🤖' },
  { id: 10109, name: 'LLM Inference', slug: 'llm-inference-engines', emoji: '⚡' },
  { id: 10108, name: 'RAG', slug: 'rag-frameworks', emoji: '🔍' },
  { id: 10106, name: 'Coding Agents', slug: 'coding-agents', emoji: '💻' },
  { id: 10105, name: 'MCP Servers', slug: 'mcp-servers', emoji: '🔌' },
  { id: 10125, name: 'AI Infra', slug: 'ai-infrastructure', emoji: '🏗️' },
  { id: 10118, name: 'Multimodal', slug: 'multimodal-ai', emoji: '🎨' },
  { id: 10058, name: 'MLOps', slug: 'mlops-tools', emoji: '🔧' },
] as const;

export interface RepoRanking {
  repo_id: number;
  repo_name: string;
  total: number;
  last_period_total: number;
  last_period_rank: number;
  last_2nd_period_rank: number;
  rank_pop: number;
  total_pop: number;
}

export interface CategoryWithRankings {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  repos: RepoRanking[];
  totalStarsEarned: number;
  repoCount: number;
  topMover: RepoRanking | null;
}

// Fetch ranking for one category
const fetchCategoryRanking = cache(async (collectionId: number): Promise<RepoRanking[]> => {
  try {
    const params = new URLSearchParams({ collectionId: String(collectionId) });
    const result = await runQuery('collection-stars-last-28-days-rank', params);
    return (result.data ?? []) as RepoRanking[];
  } catch {
    return [];
  }
});

// Fetch all categories with their top repos
export const getCategoryData = cache(async (): Promise<CategoryWithRankings[]> => {
  const results = await Promise.allSettled(
    AI_CATEGORIES.map(async (cat) => {
      const repos = await fetchCategoryRanking(cat.id);
      const totalStarsEarned = repos.reduce((sum, r) => sum + (r.last_period_total ?? 0), 0);
      // Top mover: biggest positive rank change
      const topMover = repos.reduce<RepoRanking | null>((best, r) => {
        if (r.rank_pop < 0 && (!best || r.rank_pop < best.rank_pop)) return r;
        return best;
      }, null);
      return {
        ...cat,
        repos: repos.slice(0, 5),
        totalStarsEarned,
        repoCount: repos.length,
        topMover,
      };
    })
  );
  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { ...AI_CATEGORIES[i], repos: [], totalStarsEarned: 0, repoCount: 0, topMover: null }
  );
});

// AI trending: top repos across all AI categories by this month's star growth
export function getAITrending(categories: CategoryWithRankings[]) {
  const seen = new Set<number>();
  const all: (RepoRanking & { category: string; emoji: string })[] = [];
  for (const cat of categories) {
    for (const repo of cat.repos) {
      if (!seen.has(repo.repo_id)) {
        seen.add(repo.repo_id);
        all.push({ ...repo, category: cat.name, emoji: cat.emoji });
      }
    }
  }
  return all.sort((a, b) => b.last_period_total - a.last_period_total).slice(0, 20);
}

// Trending repos for treemap — fetch trending + their topics
export const getTrendingForTreemap = cache(async () => {
  try {
    // 1. Get trending repos
    const params = new URLSearchParams({ language: 'All', period: 'past_month' });
    const result = await runQuery('trending-repos', params);
    const repos = (result.data ?? []) as Array<{
      repo_id: number;
      repo_name: string;
      description: string;
      stars: number;
      language: string;
      total_score: number;
    }>;

    if (repos.length === 0) return [];

    // 2. Get topics for these repos
    const repoIds = repos.map(r => r.repo_id);
    const { executeRows } = await import('@/lib/data-service/query');
    const topicsResult = await executeRows(
      `SELECT repo_id, topic FROM github_repo_topics WHERE repo_id IN (${repoIds.join(',')})`,
    );

    // Build repo_id -> topics map
    const topicMap = new Map<number, string[]>();
    for (const row of topicsResult.rows) {
      const rid = Number(row.repo_id);
      if (!topicMap.has(rid)) topicMap.set(rid, []);
      topicMap.get(rid)!.push(String(row.topic));
    }

    return repos.map(r => ({
      ...r,
      topics: topicMap.get(r.repo_id) ?? [],
    }));
  } catch (e) {
    console.warn('[getTrendingForTreemap]', e);
    return [];
  }
});
