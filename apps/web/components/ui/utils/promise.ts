export interface CancelablePromise<T> extends Promise<T> {
  cancel (): void;

  then<TResult1 = T, TResult2 = never> (onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): CancelablePromise<TResult1 | TResult2>;

  catch<TResult = never> (onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): CancelablePromise<T | TResult>;
}

export function makeAbortingPromise<T> (promise: Promise<T>, abortController: AbortController): CancelablePromise<T> {
  (promise as CancelablePromise<T>).cancel = () => {
    abortController.abort();
  };

  const originalThen = promise.then.bind(promise);
  const originalCatch = promise.catch.bind(promise);

  (promise as CancelablePromise<T>).then = (a, b) => {
    const newPromise = originalThen(a, b);

    return makeAbortingPromise(newPromise, abortController);
  };

  (promise as CancelablePromise<T>).catch = (a) => {
    const newPromise = originalCatch(a);

    return makeAbortingPromise(newPromise, abortController);
  };

  return promise as CancelablePromise<T>;
}

const noop = () => {};

export function makeNoopCancellablePromise<T> (promise: Promise<T>) {
  (promise as CancelablePromise<T>).cancel = noop;
  return promise as CancelablePromise<T>;
}
