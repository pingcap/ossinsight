import { makeAbortingPromise } from './promise';

// FIXME
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
  dirtyCache.set(info, [response, controller])

  return makeAbortingPromise(response.then(res => res.clone()), controller);
}
