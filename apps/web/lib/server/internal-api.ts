import { corsHeaders } from '@/lib/cors';
import orgsRecommendList from '@/lib/github-search/recommend/orgs-list.json';
import reposRecommendList1 from '@/lib/github-search/recommend/repos-list-1.json';
import reposRecommendList2 from '@/lib/github-search/recommend/repos-list-2.json';
import usersRecommendList from '@/lib/github-search/recommend/users-list.json';
import { APIError } from '@/lib/data-service';
import {
  type CollectionMetric,
  type CollectionRankRange,
  type CollectionRankingMetric,
  type CollectionSort,
  getCollectionHistoryQueryName,
  getCollectionHistoryRankQueryName,
  getCollectionRankingQueryName,
} from '@/lib/collections';
import { explainQuery, runQuery } from '@/lib/data-service/routes';
import { executeOneRow, executeRows } from '@/lib/data-service/query';

type RepoRecommendItem = {
  id: number;
  fullName: string;
};

type UserRecommendItem = {
  id: number;
  login: string;
};

const RECOMMEND_REPO_LIST_1_KEYWORD = 'recommend-repo-list-1-keyword';
const RECOMMEND_REPO_LIST_2_KEYWORD = 'recommend-repo-list-2-keyword';
const RECOMMEND_USER_LIST_KEYWORD = 'recommend-user-list-keyword';
const RECOMMEND_ORG_LIST_KEYWORD = 'recommend-org-list-keyword';
const COLLECTION_SORTS = new Set<CollectionSort>(['popular', 'az', 'recent']);
const COLLECTION_METRICS = new Set<CollectionMetric>(['stars', 'pull-requests', 'pull-request-creators', 'issues']);
const COLLECTION_RANK_RANGES = new Set<CollectionRankRange>(['last-28-days', 'month']);

export { corsPreflight as corsPreflightResponse } from '@/lib/cors';

export function jsonDataResponse(data: unknown, init?: ResponseInit, requestOrigin?: string | null) {
  return new Response(JSON.stringify({ data }), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'max-age=60',
      ...corsHeaders(requestOrigin),
      ...init?.headers,
    },
  });
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'max-age=60',
      ...init?.headers,
    },
  });
}

export interface RepoDetail {
  id: number;
  full_name: string;
  description: string;
  language: string;
  license: string;
  forks: number;
  stars: number;
  owner_login: string;
  owner_id: number;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export async function getRepoById(id: number | string, signal?: AbortSignal): Promise<RepoDetail | null> {
  const row = await executeOneRow<{
    id: number;
    full_name: string;
    description: string;
    language: string;
    license: string;
    forks: number;
    stars: number;
    owner_login: string;
    owner_id: number;
    default_branch: string;
  }>(
    `
      SELECT
        gr.repo_id AS id,
        gr.repo_name AS full_name,
        gr.description,
        gr.primary_language AS language,
        gr.license,
        gr.forks,
        gr.stars,
        gr.owner_login,
        gr.owner_id,
        '' AS default_branch
      FROM github_repos gr
      WHERE gr.repo_id = :id
        AND gr.is_deleted = 0
      LIMIT 1
    `,
    { id: Number(id) },
    signal,
  );

  if (!row) {
    return null;
  }

  return {
    ...row,
    owner: {
      login: row.owner_login,
      avatar_url: `https://avatars.githubusercontent.com/u/${row.owner_id}`,
    },
  };
}

export async function getRepoByName(owner: string, repo: string, signal?: AbortSignal): Promise<RepoDetail | null> {
  const row = await executeOneRow<{
    id: number;
    full_name: string;
    description: string;
    language: string;
    license: string;
    forks: number;
    stars: number;
    owner_login: string;
    owner_id: number;
    default_branch: string;
  }>(
    `
      SELECT
        gr.repo_id AS id,
        gr.repo_name AS full_name,
        gr.description,
        gr.primary_language AS language,
        gr.license,
        gr.forks,
        gr.stars,
        gr.owner_login,
        gr.owner_id,
        '' AS default_branch
      FROM github_repos gr
      WHERE gr.repo_name = CONCAT(:owner, '/', :repo)
        AND gr.is_deleted = 0
      LIMIT 1
    `,
    { owner, repo },
    signal,
  );

  if (!row) {
    return null;
  }

  return {
    ...row,
    owner: {
      login: row.owner_login,
      avatar_url: `https://avatars.githubusercontent.com/u/${row.owner_id}`,
    },
  };
}

export async function getUserById(id: number | string, signal?: AbortSignal) {
  return executeOneRow<{
    id: number;
    login: string;
    type: 'User' | 'Organization' | 'Bot';
    name: string;
    bio: string;
    public_repos: number;
  }>(
    `
      SELECT
        gu.id,
        gu.login,
        CASE
          WHEN gu.is_bot = 1 THEN 'Bot'
          WHEN gu.type = 'ORG' THEN 'Organization'
          ELSE 'User'
        END AS type,
        COALESCE(NULLIF(gu.name, ''), gu.login) AS name,
        '' AS bio,
        gu.public_repos
      FROM github_users gu
      WHERE gu.id = :id
        AND gu.is_deleted = 0
      LIMIT 1
    `,
    { id: Number(id) },
    signal,
  );
}

export async function getUserByLogin(username: string, signal?: AbortSignal) {
  return executeOneRow<{
    id: number;
    login: string;
    type: 'User' | 'Organization' | 'Bot';
    name: string;
    bio: string;
    public_repos: number;
  }>(
    `
      SELECT
        gu.id,
        gu.login,
        CASE
          WHEN gu.is_bot = 1 THEN 'Bot'
          WHEN gu.type = 'ORG' THEN 'Organization'
          ELSE 'User'
        END AS type,
        COALESCE(NULLIF(gu.name, ''), gu.login) AS name,
        '' AS bio,
        gu.public_repos
      FROM github_users gu
      WHERE LOWER(gu.login) = LOWER(:username)
        AND gu.is_deleted = 0
      LIMIT 1
    `,
    { username },
    signal,
  );
}

export async function searchRepos(keyword: string, signal?: AbortSignal) {
  const normalizedKeyword = keyword.trim().replaceAll(/\s+/g, ' ');
  if (!normalizedKeyword) {
    return [];
  }
  if (normalizedKeyword === RECOMMEND_REPO_LIST_1_KEYWORD) {
    return mapRecommendRepos(reposRecommendList1 as RepoRecommendItem[]);
  }
  if (normalizedKeyword === RECOMMEND_REPO_LIST_2_KEYWORD) {
    return mapRecommendRepos(reposRecommendList2 as RepoRecommendItem[]);
  }

  const { rows } = await executeRows(
    `
      SELECT
        gr.repo_id AS id,
        gr.repo_name AS fullName
      FROM github_repos gr
      WHERE gr.is_deleted = 0
        AND (
          LOWER(gr.repo_name) = LOWER(:keyword)
          OR LOWER(gr.repo_name) LIKE CONCAT(LOWER(:keyword), '%')
          OR gr.owner_login LIKE CONCAT(:keyword, '%')
        )
      ORDER BY
        CASE
          WHEN LOWER(gr.repo_name) = LOWER(:keyword) THEN 0
          WHEN LOWER(gr.repo_name) LIKE CONCAT(LOWER(:keyword), '/%') THEN 1
          WHEN gr.owner_login = :keyword THEN 2
          ELSE 3
        END,
        gr.stars DESC,
        gr.last_event_at DESC
      LIMIT 10
    `,
    { keyword: normalizedKeyword },
    signal,
  );

  return rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    defaultBranchRef: { name: '' },
  }));
}

export async function searchUsers(keyword: string, kind: 'user' | 'org', signal?: AbortSignal) {
  const normalizedKeyword = keyword.trim().replaceAll(/\s+/g, ' ');
  if (!normalizedKeyword) {
    return [];
  }
  if (kind === 'user' && normalizedKeyword === RECOMMEND_USER_LIST_KEYWORD) {
    return randomTake(usersRecommendList as UserRecommendItem[], 10);
  }
  if (kind === 'org' && normalizedKeyword === RECOMMEND_ORG_LIST_KEYWORD) {
    return randomTake(orgsRecommendList as UserRecommendItem[], 10);
  }

  const { rows } = await executeRows(
    `
      SELECT
        gu.id,
        gu.login
      FROM github_users gu
      WHERE gu.is_deleted = 0
        AND (
          LOWER(gu.login) = LOWER(:keyword)
          OR LOWER(gu.login) LIKE CONCAT(LOWER(:keyword), '%')
        )
        AND (
          (:kind = 'org' AND gu.type = 'ORG')
          OR (:kind = 'user' AND gu.type != 'ORG' AND gu.is_bot = 0)
        )
      ORDER BY
        CASE
          WHEN LOWER(gu.login) = LOWER(:keyword) THEN 0
          WHEN LOWER(gu.login) LIKE CONCAT(LOWER(:keyword), '%') THEN 1
          ELSE 2
        END,
        gu.followers DESC,
        gu.public_repos DESC,
        gu.last_event_at DESC
      LIMIT 10
    `,
    { keyword: normalizedKeyword, kind },
    signal,
  );

  return rows.map((row) => ({
    id: row.id,
    login: row.login,
  }));
}

export async function listCollections(signal?: AbortSignal) {
  const { rows } = await executeRows(
    `
      SELECT
        c.id,
        c.name,
        c.public,
        COALESCE(c.past_month_visits, 0) AS past_month_visits
      FROM collections c
      WHERE c.deleted_at IS NULL
        AND c.public = 1
      ORDER BY c.past_month_visits DESC, c.name ASC
    `,
    null,
    signal,
  );

  return rows;
}

export interface CollectionSearchOptions {
  keyword?: string;
  page?: number | string;
  pageSize?: number | string;
  sort?: CollectionSort | string;
}

export interface CollectionSearchResult {
  data: Array<{
    id: number;
    name: string;
    public: number;
    past_month_visits: number;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  keyword: string;
  sort: CollectionSort;
}

export interface CollectionPreviewRepo {
  collection_id: number;
  repo_id: number;
  repo_name: string;
  repo_count: number;
  repo_rank: number;
}

export async function searchCollections(
  options: CollectionSearchOptions = {},
  signal?: AbortSignal,
): Promise<CollectionSearchResult> {
  const keyword = options.keyword?.trim() ?? '';
  const page = normalizePositiveInteger(options.page, 1);
  const pageSize = clamp(normalizePositiveInteger(options.pageSize, 20), 1, 100);
  const sort = normalizeCollectionSort(options.sort);
  const offset = (page - 1) * pageSize;
  const orderBy = getCollectionOrderBy(sort);

  const filters = `
    FROM collections c
    WHERE c.deleted_at IS NULL
      AND c.public = 1
      AND (:keyword = '' OR LOWER(c.name) LIKE CONCAT('%', LOWER(:keyword), '%'))
  `;
  const params = {
    keyword,
    limit: pageSize,
    offset,
  };

  const [totalRow, rowsResult] = await Promise.all([
    executeOneRow<{ total: number }>(
      `
        SELECT COUNT(*) AS total
        ${filters}
      `,
      params,
      signal,
    ),
    executeRows(
      `
        SELECT
          c.id,
          c.name,
          c.public,
          COALESCE(c.past_month_visits, 0) AS past_month_visits
        ${filters}
        ORDER BY ${orderBy}
        LIMIT :limit OFFSET :offset
      `,
      params,
      signal,
    ),
  ]);

  const total = Number(totalRow?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    data: rowsResult.rows as CollectionSearchResult['data'],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: totalPages > 0 && page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    },
    keyword,
    sort,
  };
}

export async function getHotCollections(signal?: AbortSignal) {
  return runQuery('recent-hot-collections', new URLSearchParams(), signal);
}

export async function listCollectionPreviewRepos(
  collectionIds: Array<number | string>,
  signal?: AbortSignal,
): Promise<CollectionPreviewRepo[]> {
  const ids = collectionIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0);

  if (ids.length === 0) {
    return [];
  }

  const placeholders = ids.map((_, index) => `:id${index}`).join(', ');
  const params = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
  const { rows } = await executeRows(
    `
      SELECT
        ranked.collection_id,
        ranked.repo_id,
        ranked.repo_name,
        counts.repo_count,
        ranked.repo_rank
      FROM (
        SELECT
          ci.collection_id,
          ci.repo_id,
          ci.repo_name,
          ROW_NUMBER() OVER (
            PARTITION BY ci.collection_id
            ORDER BY COALESCE(gr.stars, 0) DESC, ci.repo_name ASC
          ) AS repo_rank
        FROM collection_items ci
        LEFT JOIN github_repos gr
          ON gr.repo_id = ci.repo_id
         AND gr.is_deleted = 0
        WHERE ci.deleted_at IS NULL
          AND ci.collection_id IN (${placeholders})
      ) ranked
      JOIN (
        SELECT
          ci.collection_id,
          COUNT(*) AS repo_count
        FROM collection_items ci
        WHERE ci.deleted_at IS NULL
          AND ci.collection_id IN (${placeholders})
        GROUP BY ci.collection_id
      ) counts
        ON counts.collection_id = ranked.collection_id
      WHERE ranked.repo_rank <= 3
      ORDER BY ranked.collection_id, ranked.repo_rank
    `,
    params,
    signal,
  );

  return rows as CollectionPreviewRepo[];
}

export async function explainHotCollections(signal?: AbortSignal) {
  return explainQuery('recent-hot-collections', new URLSearchParams(), signal);
}

export async function getCollectionRanking(
  collectionId: number | string,
  metric: CollectionRankingMetric,
  range: CollectionRankRange,
  signal?: AbortSignal,
) {
  return runQuery(getCollectionRankingQueryName(metric, range), toCollectionSearchParams(collectionId), signal);
}

export async function explainCollectionRanking(
  collectionId: number | string,
  metric: CollectionRankingMetric,
  range: CollectionRankRange,
  signal?: AbortSignal,
) {
  return explainQuery(getCollectionRankingQueryName(metric, range), toCollectionSearchParams(collectionId), signal);
}

export async function getCollectionHistory(
  collectionId: number | string,
  metric: CollectionMetric,
  signal?: AbortSignal,
) {
  return runQuery(getCollectionHistoryQueryName(metric), toCollectionSearchParams(collectionId), signal);
}

export async function explainCollectionHistory(
  collectionId: number | string,
  metric: CollectionMetric,
  signal?: AbortSignal,
) {
  return explainQuery(getCollectionHistoryQueryName(metric), toCollectionSearchParams(collectionId), signal);
}

export async function getCollectionHistoryRank(
  collectionId: number | string,
  metric: CollectionMetric,
  signal?: AbortSignal,
) {
  return runQuery(getCollectionHistoryRankQueryName(metric), toCollectionSearchParams(collectionId), signal);
}

export async function explainCollectionHistoryRank(
  collectionId: number | string,
  metric: CollectionMetric,
  signal?: AbortSignal,
) {
  return explainQuery(getCollectionHistoryRankQueryName(metric), toCollectionSearchParams(collectionId), signal);
}

export function normalizeCollectionSort(value: CollectionSort | string | null | undefined): CollectionSort {
  if (value && COLLECTION_SORTS.has(value as CollectionSort)) {
    return value as CollectionSort;
  }
  return 'popular';
}

export function parseCollectionMetric(value: string | null | undefined): CollectionMetric {
  if (value && COLLECTION_METRICS.has(value as CollectionMetric)) {
    return value as CollectionMetric;
  }
  throw new APIError('Invalid collection metric.', 400);
}

export function parseCollectionRankingMetric(value: string | null | undefined): CollectionRankingMetric {
  const metric = parseCollectionMetric(value);
  if (metric === 'pull-request-creators') {
    throw new APIError('Pull request creators do not support period ranking.', 400);
  }
  return metric;
}

export function parseCollectionRankRange(value: string | null | undefined): CollectionRankRange {
  if (value && COLLECTION_RANK_RANGES.has(value as CollectionRankRange)) {
    return value as CollectionRankRange;
  }
  throw new APIError('Invalid collection ranking range.', 400);
}

export function parseCollectionId(value: number | string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new APIError('Invalid collection id.', 400);
  }
  return id;
}

function normalizePositiveInteger(value: number | string | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCollectionOrderBy(sort: CollectionSort) {
  switch (sort) {
    case 'az':
      return 'c.name ASC';
    case 'recent':
      return 'c.id DESC, c.name ASC';
    case 'popular':
    default:
      return 'c.past_month_visits DESC, c.name ASC';
  }
}

function toCollectionSearchParams(collectionId: number | string) {
  const searchParams = new URLSearchParams();
  searchParams.set('collectionId', String(parseCollectionId(collectionId)));
  return searchParams;
}

export const LANGUAGES = [
  'JavaScript', 'Java', 'Python', 'PHP', 'C++', 'C#', 'TypeScript', 'Shell', 'C', 'Ruby',
  'Rust', 'Go', 'Kotlin', 'HCL', 'PowerShell', 'CMake', 'Groovy', 'PLpgSQL', 'TSQL', 'Dart',
  'Swift', 'HTML', 'CSS', 'Elixir', 'Haskell', 'Solidity', 'Assembly', 'R', 'Scala', 'Julia',
  'Lua', 'Clojure', 'Erlang', 'Common Lisp', 'Emacs Lisp', 'OCaml', 'MATLAB', 'Objective-C',
  'Perl', 'Fortran',
] as const;

export type Language = (typeof LANGUAGES)[number];

export function isValidLanguage(lang: string): lang is Language {
  return (LANGUAGES as readonly string[]).includes(lang);
}

export async function getTrendingReposByLanguage(
  language: string,
  period: 'past_24_hours' | 'past_week' | 'past_month' = 'past_month',
  signal?: AbortSignal,
) {
  const { rows } = await executeRows(
    `
      WITH latest_snapshot AS (
        SELECT MAX(dt) AS dt
        FROM mv_trending_repos
        WHERE language = :lang
          AND period = :per
      )
      SELECT
        tr.repo_id,
        gr.repo_name,
        gr.primary_language AS language,
        gr.description,
        tr.stars,
        tr.forks,
        tr.total_score
      FROM mv_trending_repos tr
      JOIN latest_snapshot ls ON tr.dt = ls.dt
      JOIN github_repos gr ON tr.repo_id = gr.repo_id
      WHERE tr.language = :lang
        AND tr.period = :per
      ORDER BY tr.total_score DESC
      LIMIT 50
    `,
    { lang: language, per: period },
    signal,
  );
  return rows as Array<{
    repo_id: number;
    repo_name: string;
    language: string;
    description: string;
    stars: number;
    forks: number;
    total_score: number;
  }>;
}

export const PERIODS = [
  { value: 'past_24_hours', label: 'Today' },
  { value: 'past_week', label: 'This Week' },
  { value: 'past_month', label: 'This Month' },
  { value: 'past_3_months', label: 'Past 3 Months' },
] as const;

export type Period = (typeof PERIODS)[number]['value'];

export function isValidPeriod(p: string): p is Period {
  return PERIODS.some((item) => item.value === p);
}

export async function getTrendingRepos(
  language: string = 'All',
  period: Period = 'past_week',
  signal?: AbortSignal,
) {
  const { rows } = await executeRows(
    `
      WITH latest_snapshot AS (
        SELECT MAX(dt) AS dt
        FROM mv_trending_repos
        WHERE language = ?
          AND period = ?
      )
      SELECT
        tr.repo_id,
        gr.repo_name,
        gr.primary_language AS language,
        gr.description,
        tr.stars,
        tr.forks,
        tr.total_score
      FROM mv_trending_repos tr
      JOIN latest_snapshot ls ON tr.dt = ls.dt
      JOIN github_repos gr ON tr.repo_id = gr.repo_id
      WHERE tr.language = ?
        AND tr.period = ?
      ORDER BY tr.total_score DESC
      LIMIT 100
    `,
    [language, period, language, period],
    signal,
  );
  return rows as Array<{
    repo_id: number;
    repo_name: string;
    language: string;
    description: string;
    stars: number;
    forks: number;
    total_score: number;
  }>;
}

export async function getTopReposForSitemap(limit = 10000, signal?: AbortSignal) {
  const { rows } = await executeRows(
    `
      SELECT
        gr.repo_name
      FROM github_repos gr
      WHERE gr.is_deleted = 0
        AND gr.stars >= 1000
      ORDER BY gr.stars DESC
      LIMIT :limit
    `,
    { limit },
    signal,
  );
  return rows as Array<{ repo_name: string }>;
}

function mapRecommendRepos(repos: RepoRecommendItem[]) {
  return repos.map((repo) => ({
    id: repo.id,
    fullName: repo.fullName,
    defaultBranchRef: { name: '' },
  }));
}

function randomTake<T>(items: T[], size: number) {
  if (items.length <= size) {
    return items;
  }

  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, size);
}
