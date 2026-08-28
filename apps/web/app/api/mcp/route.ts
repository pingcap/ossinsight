import {
  listCollections,
  searchCollections,
  getCollectionRanking,
  getRepoByName,
  getTrendingRepos,
  isValidPeriod,
  type Period,
} from '@/lib/server/internal-api';
import type {
  CollectionRankingMetric,
  CollectionRankRange,
} from '@/lib/collections';
import { isStarRankingDegraded, STAR_DATA_INCIDENT } from '@/lib/data-quality';
import { DegradedDataError } from '@/lib/data-service';

export const runtime = 'edge';
export const revalidate = 300; // 5 min cache

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function ok(data: unknown) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Structured degraded response (documented in ./README.md): HTTP 503 with
 * `{ ok: false, error, data_quality }` so agents can distinguish an active
 * data incident from a regular failure. Never cached.
 */
function degraded(message: string) {
  return new Response(
    JSON.stringify({ ok: false, error: message, data_quality: STAR_DATA_INCIDENT.marker }),
    {
      status: 503,
      headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
    },
  );
}

const VALID_METRICS = new Set(['stars', 'pull-requests', 'pull-request-creators', 'issues']);
const VALID_RANGES = new Set(['last-28-days', 'month']);

async function handleCollections() {
  const collections = await listCollections();
  return ok(collections);
}

async function handleRanking(params: URLSearchParams) {
  const collectionId = params.get('collectionId');
  if (!collectionId) return err('Missing collectionId parameter');

  const metric = (params.get('metric') || 'stars') as CollectionRankingMetric;
  if (!VALID_METRICS.has(metric)) return err(`Invalid metric. Use: ${[...VALID_METRICS].join(', ')}`);

  const range = (params.get('range') || 'last-28-days') as CollectionRankRange;
  if (!VALID_RANGES.has(range)) return err(`Invalid range. Use: ${[...VALID_RANGES].join(', ')}`);

  // Star rankings are built on WatchEvent rows and are blocked while the
  // star-data incident is active. Other metrics still run, but their
  // payloads carry a data_quality marker (counts are lower bounds).
  if (metric === 'stars' && isStarRankingDegraded()) {
    return degraded('Star-based rankings are temporarily unavailable due to degraded GitHub event data. Try metric=pull-requests or metric=issues (lower-bound counts), or action=repo for accurate star totals.');
  }

  const result = await getCollectionRanking(Number(collectionId), metric, range);
  return ok(result);
}

async function handleRepo(params: URLSearchParams) {
  const owner = params.get('owner');
  const repo = params.get('repo');
  if (!owner || !repo) return err('Missing owner and/or repo parameters');

  const repoData = await getRepoByName(owner, repo);
  if (!repoData) return err('Repository not found', 404);
  return ok(repoData);
}

async function handleTrending(params: URLSearchParams) {
  const language = params.get('language') || 'All';
  const period = params.get('period') || 'past_week';

  if (!isValidPeriod(period)) {
    return err('Invalid period. Use: past_24_hours, past_week, past_month, past_3_months');
  }

  // Trending scores are dominated by WatchEvent counts; blocked while the
  // star-data incident is active.
  if (isStarRankingDegraded()) {
    return degraded('Trending rankings are temporarily unavailable due to degraded GitHub event data. Use action=repo for accurate per-repository star totals.');
  }

  const repos = await getTrendingRepos(language, period as Period);
  return ok(repos);
}

async function handleSearch(params: URLSearchParams) {
  const q = params.get('q');
  if (!q) return err('Missing q parameter');

  const result = await searchCollections({ keyword: q, pageSize: '20' });
  return ok(result);
}

async function handleCompare(params: URLSearchParams) {
  const repo1 = params.get('repo1');
  const repo2 = params.get('repo2');
  if (!repo1 || !repo2) return err('Missing repo1 and/or repo2 parameters (format: owner/repo)');

  const [owner1, name1] = repo1.split('/');
  const [owner2, name2] = repo2.split('/');
  if (!owner1 || !name1 || !owner2 || !name2) return err('Invalid repo format. Use owner/repo');

  const [r1, r2] = await Promise.all([
    getRepoByName(owner1, name1),
    getRepoByName(owner2, name2),
  ]);

  if (!r1) return err(`Repository ${repo1} not found`, 404);
  if (!r2) return err(`Repository ${repo2} not found`, 404);

  return ok({ repo1: r1, repo2: r2 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (!action) {
    return ok({
      name: 'OSSInsight MCP API',
      version: '1.0.0',
      description: 'REST API for AI agents to access GitHub open source intelligence',
      actions: {
        collections: 'List all curated collections',
        ranking: 'Get collection ranking (params: collectionId, metric?, range?)',
        repo: 'Get repository analytics (params: owner, repo)',
        trending: 'Get trending repositories (params: language?, period?)',
        search: 'Search collections (params: q)',
        compare: 'Compare two repositories (params: repo1, repo2)',
      },
      docs: 'https://ossinsight.io/llms.txt',
      // Surfaced while the star-data incident is active: trending and
      // metric=stars rankings return 503 with this same marker attached.
      ...(isStarRankingDegraded() ? { data_quality: STAR_DATA_INCIDENT.marker } : null),
    });
  }

  try {
    switch (action) {
      case 'collections': return await handleCollections();
      case 'ranking': return await handleRanking(searchParams);
      case 'repo': return await handleRepo(searchParams);
      case 'trending': return await handleTrending(searchParams);
      case 'search': return await handleSearch(searchParams);
      case 'compare': return await handleCompare(searchParams);
      default: return err(`Unknown action: ${action}. Available: collections, ranking, repo, trending, search, compare`);
    }
  } catch (error) {
    if (error instanceof DegradedDataError) {
      return degraded(error.message);
    }
    console.error(`[MCP API] Error handling action=${action}:`, error);
    return err('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
