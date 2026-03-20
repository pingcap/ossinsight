import { DateTime } from 'luxon';
import { Liquid } from 'liquidjs';
import loadEndpoint, { hasEndpoint } from '@/lib/data-service/endpoints';
import { APIError, executeEndpoint } from '@/lib/data-service';
import { applyLegacyQueryParameters, prepareQueryContext } from '@/lib/data-service/executor/utils';
import { executeRows } from './query';

const templateEngine = new Liquid();
const TEN_MINUTES = 10 * 60 * 1000;

type QueryField = {
  name: string;
  columnType: unknown;
};

type QueryResult = {
  query: string;
  params: Record<string, any>;
  sql: string;
  data: Record<string, any>[];
  requestedAt: string;
  finishedAt: string;
  spent: number;
  fields: QueryField[];
  types: Record<string, unknown> | undefined;
  geo?: unknown;
};

type CachedQueryEntry = {
  expiresAt: number;
  value: QueryResult;
};

// Keep hot homepage queries warm across requests and dedupe concurrent fetches.
const cachedTrendingRepos = new Map<string, CachedQueryEntry>();
const inflightTrendingRepos = new Map<string, Promise<QueryResult>>();

export function getQueryName(query: string | string[]) {
  if (typeof query === 'string') {
    return decodeURIComponent(query);
  }
  return query.map(decodeURIComponent).join('/');
}

export function getSearchParams(searchParams: URLSearchParams) {
  const queryParams: Record<string, string | string[]> = {};
  for (const [name, value] of searchParams.entries()) {
    const previous = queryParams[name];
    if (previous == null) {
      queryParams[name] = value;
      continue;
    }
    if (previous instanceof Array) {
      previous.push(value);
      continue;
    }
    queryParams[name] = [previous, value];
  }
  return queryParams;
}

export async function runQuery(queryName: string, searchParams: URLSearchParams, signal?: AbortSignal) {
  if (!hasEndpoint(queryName)) {
    throw new APIError('Endpoint not found.', 404);
  }

  const endpoint = await loadEndpoint(queryName);
  const queryParams = getSearchParams(searchParams);
  const result = queryName === 'trending-repos'
    ? await runTrendingReposQuery(endpoint.config, endpoint.sql, queryParams, signal)
    : await executeEndpoint(queryName, endpoint.config, endpoint.sql, queryParams, undefined, signal);

  return {
    query: queryName,
    params: result.params,
    sql: result.sql,
    data: result.data,
    requestedAt: result.requestedAt,
    finishedAt: result.finishedAt,
    spent: result.spent,
    fields: Object.entries(result.types ?? {}).map(([name, columnType]) => ({
      name,
      columnType,
    })),
    types: result.types,
    geo: result.geo,
  };
}

export async function explainQuery(queryName: string, searchParams: URLSearchParams, signal?: AbortSignal) {
  if (!hasEndpoint(queryName)) {
    throw new APIError('Endpoint not found.', 404);
  }

  const endpoint = await loadEndpoint(queryName);
  const queryParams = getSearchParams(searchParams);
  const context = prepareQueryContext(endpoint.config, queryParams);
  const sql = await templateEngine.parseAndRender(applyLegacyQueryParameters(endpoint.config, endpoint.sql, context), context);
  // Note: EXPLAIN cannot use parameterized queries for the statement itself,
  // but the SQL has already been validated through prepareQueryContext + template rendering.
  const explainResult = await executeRows(`EXPLAIN FORMAT = 'brief' ${sql}`, null, signal);

  return {
    query: queryName,
    params: context,
    sql,
    data: explainResult.rows,
    fields: Object.keys(explainResult.types).map((name) => ({
      name,
      columnType: explainResult.types[name],
    })),
    requestedAt: DateTime.now().toISO(),
    finishedAt: DateTime.now().toISO(),
  };
}

async function runTrendingReposQuery(
  config: Parameters<typeof prepareQueryContext>[0],
  sqlTemplate: string,
  queryParams: Record<string, any>,
  signal?: AbortSignal,
) {
  const params = prepareQueryContext(config, queryParams);
  const cacheKey = getTrendingReposCacheKey(params);
  const cached = cachedTrendingRepos.get(cacheKey);

  signal?.throwIfAborted();
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const inflight = inflightTrendingRepos.get(cacheKey);
  if (inflight) {
    const result = await inflight;
    signal?.throwIfAborted();
    return result;
  }

  const nextRequest = loadTrendingReposFromMaterializedView(params)
    .then((result) => {
      cachedTrendingRepos.set(cacheKey, {
        expiresAt: Date.now() + TEN_MINUTES,
        value: result,
      });
      return result;
    })
    .finally(() => {
      inflightTrendingRepos.delete(cacheKey);
    });

  inflightTrendingRepos.set(cacheKey, nextRequest);

  const result = await nextRequest;
  signal?.throwIfAborted();
  return result;
}

function getTrendingReposCacheKey(params: Record<string, any>) {
  return JSON.stringify(
    Object.entries(params)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function loadTrendingReposFromMaterializedView(params: Record<string, any>) {
  const language = String(params.language);
  const period = String(params.period);
  const sql = `
WITH latest_snapshot AS (
    SELECT MAX(dt) AS dt
    FROM mv_trending_repos
    WHERE language = ?
      AND period = ?
), repos AS (
    SELECT
        tr.repo_id,
        gr.repo_name,
        gr.primary_language AS language,
        gr.description,
        tr.stars,
        tr.forks,
        tr.pull_requests,
        tr.pushes,
        tr.total_score,
        tr.contributor_logins
    FROM mv_trending_repos tr
    JOIN latest_snapshot ls ON tr.dt = ls.dt
    JOIN github_repos gr ON tr.repo_id = gr.repo_id
    WHERE tr.language = ?
      AND tr.period = ?
), repo_with_collections AS (
    SELECT
        r.repo_id,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ',') AS collection_names
    FROM repos r
    JOIN collection_items ci ON ci.repo_id = r.repo_id AND ci.deleted_at IS NULL
    JOIN collections c ON ci.collection_id = c.id
    WHERE c.public = TRUE
    GROUP BY r.repo_id
)
SELECT
    r.repo_id,
    r.repo_name,
    r.language,
    r.description,
    r.stars,
    r.forks,
    r.pull_requests,
    r.pushes,
    r.total_score,
    r.contributor_logins,
    rc.collection_names
FROM repos r
LEFT JOIN repo_with_collections rc ON rc.repo_id = r.repo_id
ORDER BY r.total_score DESC
LIMIT 100
  `.trim();

  const start = DateTime.now();
  const result = await executeRows(sql, [language, period, language, period]);
  const end = DateTime.now();

  return {
    query: 'trending-repos',
    params,
    sql: result.statement,
    data: result.rows,
    requestedAt: start.toISO(),
    finishedAt: end.toISO(),
    spent: end.diff(start).as('seconds'),
    fields: Object.entries(result.types ?? {}).map(([name, columnType]) => ({
      name,
      columnType,
    })),
    types: result.types,
  } satisfies QueryResult;
}

