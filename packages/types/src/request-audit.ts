import {isPublicQuery} from './query-access';
import {isGitHubOwner, isGitHubLogin, isGitHubRepository} from './github-identifiers';

const NUMERIC_PARAMETERS = new Set(['id', 'repoId', 'userId', 'orgId', 'collectionId', 'collection_id', 'page', 'limit', 'per_page']);
const ENUM_PARAMETERS: Record<string, readonly string[]> = {
  metric: ['stars', 'pull-requests', 'issues', 'pull-request-creators'],
  range: ['last-28-days', 'month'],
  period: ['day', 'week', 'month', 'year'],
  order: ['asc', 'desc'],
  orderBy: ['stars', 'forks', 'total', 'updated_at'],
  excludeBots: ['true', 'false'],
};

function positiveInteger(value: string): number | undefined {
  if (!/^(?:0|[1-9][0-9]{0,15})$/.test(value)) return;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
}

function resourceSegment(name: string, value: string): string {
  if (['query', 'queryName', '*'].includes(name)) return isPublicQuery(value, {}) ? value : '[redacted]';
  if (['id', 'repoId', 'userId', 'collectionId', 'collection_id'].includes(name)) {
    return positiveInteger(value) !== undefined ? value : '[redacted]';
  }
  if (name === 'questionId') return /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value) ? value.toLowerCase() : '[redacted]';
  if (name === 'owner') return isGitHubOwner(value) ? value : '[redacted]';
  if (name === 'repo') return isGitHubRepository(value) ? value : '[redacted]';
  if (['username', 'login'].includes(name)) return isGitHubLogin(value) ? value : '[redacted]';
  return '[redacted]';
}

/** Resolve only reviewed resource shapes. Never record a raw URL, querystring or body. */
export function requestAuditContext(route: string, rawURL?: string) {
  const template = route.replace(/^[A-Z]+ /, '');
  const result = {resource: template, parameters: {} as Record<string, string | number>, omittedParameterCount: 0};
  if (!rawURL || rawURL.length > 8192) return result;
  try {
    const url = new URL(rawURL, 'https://audit.invalid');
    const parts = url.pathname.split('/').filter(Boolean).map(part => decodeURIComponent(part));
    const patterns = template.split('/').filter(Boolean);
    const resolved: string[] = [];
    let cursor = 0;
    for (const pattern of patterns) {
      const dynamic = /^\[(?:\.\.\.)?([^\]]+)\]$/.exec(pattern)?.[1] || (/^:(.+)$/.exec(pattern)?.[1]);
      const catchAll = pattern === '*' || pattern.startsWith('[...');
      if (dynamic || catchAll) {
        const value = catchAll ? parts.slice(cursor).join('/') : parts[cursor] || '';
        resolved.push(resourceSegment(dynamic || '*', value));
        cursor = catchAll ? parts.length : cursor + 1;
      } else {
        if (parts[cursor++] !== pattern) return result;
        resolved.push(pattern);
      }
    }
    if (cursor !== parts.length) return result;
    result.resource = '/' + resolved.join('/');
    const entries = [...url.searchParams];
    const counts = new Map<string, number>();
    for (const [name] of entries) counts.set(name, (counts.get(name) || 0) + 1);
    for (const [name, value] of entries) {
      let safe: string | number | undefined;
      if (counts.get(name) === 1) {
        if (NUMERIC_PARAMETERS.has(name)) safe = positiveInteger(value);
        else if (Object.prototype.hasOwnProperty.call(ENUM_PARAMETERS, name) && ENUM_PARAMETERS[name].includes(value)) safe = value;
      }
      if (safe === undefined) result.omittedParameterCount++;
      else result.parameters[name] = safe;
    }
  } catch { /* Malformed encodings must not become another logging failure. */ }
  return result;
}

/** IP parsing without Node-only APIs, shared by Edge and Node handlers. */
export function canonicalAuditIP(value: string | null | undefined): string | undefined {
  if (!value || value.length > 45) return;
  if (/^(?:0|[1-9][0-9]{0,2})(?:\.(?:0|[1-9][0-9]{0,2})){3}$/.test(value)) {
    return value.split('.').every(part => Number(part) <= 255) ? value : undefined;
  }
  if (!value.includes(':') || !/^[a-f0-9:.]+$/i.test(value)) return;
  try { return new URL(`http://[${value}]/`).hostname.slice(1, -1); }
  catch { return; }
}
