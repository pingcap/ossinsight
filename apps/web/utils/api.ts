import { cache } from 'react';

// React.cache only works on the server; on the client we skip it.
const serverCache = typeof window === 'undefined' ? cache : <T extends (...args: any[]) => any>(fn: T) => fn;

export const PUBLIC_API_SERVER = 'https://api.ossinsight.io';
export const EXPLORER_API_SERVER = process.env.NEXT_PUBLIC_EXPLORER_API_SERVER || PUBLIC_API_SERVER;
export const API_SERVER = typeof window === 'undefined' ? getSiteOrigin() : '';
export const INTERNAL_API_SERVER = `${API_SERVER}/api`;
export const INTERNAL_QUERY_API_SERVER = `${INTERNAL_API_SERVER}/q`;
export const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST || (typeof window === 'undefined' ? getSiteOrigin() : window.location.origin);

export function getSiteOrigin() {
  const explicitHost = process.env.NEXT_PUBLIC_SITE_HOST;
  if (explicitHost) {
    return explicitHost.replace(/\/$/, '');
  }

  const previewHost =
    process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL;
  if (previewHost) {
    return `https://${previewHost}`;
  }

  return `http://127.0.0.1:${process.env.PORT || 3001}`;
}

export function rewriteInternalApiUrl(url: string) {
  if (url.startsWith(`${PUBLIC_API_SERVER}/q/`)) {
    return `${INTERNAL_QUERY_API_SERVER}/${url.slice(`${PUBLIC_API_SERVER}/q/`.length)}`;
  }
  if (url.startsWith(`${PUBLIC_API_SERVER}/gh/`)) {
    return `${API_SERVER}/gh/${url.slice(`${PUBLIC_API_SERVER}/gh/`.length)}`;
  }
  if (url === `${PUBLIC_API_SERVER}/collections`) {
    return `${API_SERVER}/collections/api`;
  }
  if (url.startsWith(`${PUBLIC_API_SERVER}/collections?`)) {
    return `${API_SERVER}/collections/api${url.slice(`${PUBLIC_API_SERVER}/collections`.length)}`;
  }
  return url;
}

export interface RemoteData<T> {
  query: string;
  params: Record<string, any>;
  data: T[];
  requestedAt: string;
  expiresAt: string;
  spent: number;
  sql: string;
  fields: Array<{
    name: string & keyof T;
    columnType: number;
  }>;
}

export async function queryAPI<T = any>(
  query: string,
  params?: Record<string, any>,
  signal?: AbortSignal,
): Promise<RemoteData<T>> {
  const usp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach(v => usp.append(key, String(v)));
      } else {
        usp.set(key, String(value));
      }
    });
  }
  const url = `${INTERNAL_QUERY_API_SERVER}/${query}?${usp.toString()}`;
  const res = await fetch(url, { signal, cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface Collection {
  id: number;
  name: string;
  public: number;
  past_month_visits?: number;
}

async function _fetchCollections(): Promise<Collection[]> {
  if (typeof window === 'undefined') {
    const { listCollections } = await import('@/lib/server/internal-api');
    const collections = await listCollections() as Collection[];
    return collections.filter((collection) => collection.public !== 0);
  }

  const res = await fetch(`${API_SERVER}/collections/api`);
  if (!res.ok) {
    throw new Error(`Failed to fetch collections: ${res.status}`);
  }
  const json = await res.json();
  const collections = (json.data ?? []) as Collection[];
  return collections.filter((collection) => collection.public !== 0);
}

// React.cache deduplicates calls within a single server request,
// so generateMetadata and the page component share the same result.
export const fetchCollections = serverCache(_fetchCollections);

export async function fetchGitHubUser(login: string) {
  if (typeof window === 'undefined') {
    const { getUserByLogin } = await import('@/lib/server/internal-api');
    return { data: await getUserByLogin(login) };
  }

  const res = await fetch(`${API_SERVER}/gh/users/${encodeURIComponent(login)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`);
  }
  return res.json();
}

export async function fetchGitHubRepo(owner: string, repo: string) {
  if (typeof window === 'undefined') {
    const { getRepoByName } = await import('@/lib/server/internal-api');
    return { data: await getRepoByName(owner, repo) };
  }

  const res = await fetch(`${API_SERVER}/gh/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch repo: ${res.status}`);
  }
  return res.json();
}
