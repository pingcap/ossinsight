import {unstable_rethrow} from 'next/navigation';
import {withRequestAudit as auditBoundary} from './request-audit';

export function withRequestAudit<A extends unknown[]>(route: string, handler: (...args: A) => Promise<Response>) {
  // Next redirects, not-found and dynamic-rendering signals must reach Next's
  // runtime instead of being converted into a cached generic error response.
  return auditBoundary(route, handler, unstable_rethrow);
}
