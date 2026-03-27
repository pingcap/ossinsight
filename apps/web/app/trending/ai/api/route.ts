import { getCollectionRanking, jsonResponse } from '@/lib/server/internal-api';

export const runtime = 'edge';

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

export type AIRepoItem = {
  repo_id: number;
  repo_name: string;
  total: number;
  last_period_total?: number;
  last_period_rank?: number;
  growth: number;
  category: string;
  collection_id: number;
};

export type TrendingAIResponse = {
  repos: AIRepoItem[];
  categories: { id: number; category: string; count: number; topRepo: string }[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryFilter = searchParams.get('category');

  try {
    const collections = categoryFilter
      ? AI_COLLECTIONS.filter((c) => c.category === categoryFilter)
      : AI_COLLECTIONS;

    const results = await Promise.allSettled(
      collections.map((c) => getCollectionRanking(c.id, 'stars', 'last-28-days')),
    );

    const seen = new Map<string, AIRepoItem>();

    results.forEach((result, idx) => {
      if (result.status !== 'fulfilled' || !result.value?.data) return;
      const { category, id } = collections[idx];
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

    // Build category stats from all results (not filtered)
    const allResults = categoryFilter
      ? await Promise.allSettled(AI_COLLECTIONS.map((c) => getCollectionRanking(c.id, 'stars', 'last-28-days')))
      : results;

    const categories = AI_COLLECTIONS.map((c, idx) => {
      const r = allResults[idx];
      const data = r.status === 'fulfilled' && r.value?.data ? (r.value.data as any[]) : [];
      return {
        id: c.id,
        category: c.category,
        count: data.length,
        topRepo: data[0]?.repo_name ?? '',
      };
    });

    return jsonResponse({ repos, categories } satisfies TrendingAIResponse);
  } catch (error) {
    console.error('[trending/ai/api] Failed to fetch data:', error);
    return jsonResponse({ repos: [], categories: [] }, { status: 500 });
  }
}
