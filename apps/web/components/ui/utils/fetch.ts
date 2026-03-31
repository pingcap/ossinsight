import { makeAbortingPromise } from './promise';

const DIRTY_CACHE_MAX_SIZE = 100;
const dirtyCache = new Map<URL | RequestInfo, [Promise<Response>, AbortController]>();

export function cancellableFetch (info: RequestInfo | URL, init?: Omit<RequestInit, 'signal'>) {
  const previous = dirtyCache.get(info);
  if (previous) {
    return makeAbortingPromise(previous[0].then(res => res.clone()), previous[1]);
  }

  const controller = new AbortController();
  const response = fetch(info, init)
    .finally(() => {
      dirtyCache.delete(info);
    });
  dirtyCache.set(info, [response, controller]);

  if (dirtyCache.size > DIRTY_CACHE_MAX_SIZE) {
    const oldest = dirtyCache.keys().next().value;
    if (oldest !== undefined) dirtyCache.delete(oldest);
  }

  return makeAbortingPromise(response.then(res => res.clone()), controller);
}
