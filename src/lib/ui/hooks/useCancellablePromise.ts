import { useCallback, useEffect, useRef, useState } from 'react';
import { CancelablePromise } from '../utils/promise';
import { useLatestValue } from './useLatestValue';

export type UseCancellablePromiseOptions<Params, Result> = {
  executor: (params: Params) => CancelablePromise<Result>
  defaultResult: Result | (() => Result)
}

export type UseCancellablePromiseReturns<Params, Result> = {
  execute: (params: Params) => void;
  currentParams: Params | undefined
  executing: boolean
  error: unknown
  result: Result
}

export function useCancellablePromise<Params, Result> ({ executor, defaultResult }: UseCancellablePromiseOptions<Params, Result>): UseCancellablePromiseReturns<Params, Result> {
  const [result, setResult] = useState(defaultResult);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<unknown>(undefined);

  const paramsRef = useRef<Params>();
  const lastCancellableRef = useRef<CancelablePromise<Result> | undefined>(undefined);

  const mounted = useRef(true);

  executor = useLatestValue(executor);

  const execute = useCallback((params: Params) => {
    lastCancellableRef.current?.cancel();
    setExecuting(true);
    setError(undefined);
    const resultPromise = executor(params);
    lastCancellableRef.current = resultPromise;

    void (async function () {
      try {
        const result = await resultPromise;
        if (mounted.current) {
          setResult(result);
        }
      } catch (e) {
        if (mounted.current) {
          setError(e);
        }
      } finally {
        if (mounted.current) {
          setExecuting(false);
          lastCancellableRef.current = undefined;
        }
      }
    })()
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      lastCancellableRef.current?.cancel();
    };
  }, []);

  return {
    execute,
    result,
    error,
    executing,
    currentParams: paramsRef.current,
  };
}
