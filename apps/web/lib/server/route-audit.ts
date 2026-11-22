import {unstable_rethrow} from 'next/navigation';
import {headers} from 'next/headers';
import {auditSitemap, withRequestAudit as auditBoundary} from './request-audit';

export function withRequestAudit<A extends unknown[]>(route: string, handler: (...args: A) => Promise<Response>) {
  // Next redirects, not-found and dynamic-rendering signals must reach Next's
  // runtime instead of being converted into a cached generic error response.
  return auditBoundary(route, handler, unstable_rethrow);
}

export function withSitemapAudit<T>(route: string, handler: () => Promise<T> | T) {
  return async (): Promise<T> => auditSitemap(route, await headers(), handler);
}
