import { useShouldPerformNetworkRequests } from '@/utils/useShouldPerformNetworkRequests';
import { useLatestValue } from '@/lib/ui/hooks/useLatestValue';
import { useCallback, useEffect, useRef, useState } from 'react';

type AsyncFunctionWithSignal<Args extends any[], Result> = (...args: [...Args, signal?: AbortSignal | undefined]) => Promise<Result>

// MARK: Will not auto reload after args changed.
export function usePerformanceOptimizedNetworkRequest<Args extends any[], Result> (
  fn: AsyncFunctionWithSignal<Args, Result>,
  ...args: Args
) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<unknown>();

  const { ref, value: shouldStartLoad } = useShouldPerformNetworkRequests();

  const startedReloadAtRef = useRef(0);

  const { callback, abort } = useSafeCallback(async signal => {
    setLoading(true);
    startedReloadAtRef.current = Date.now();
    try {
      const result = await fn(...args, signal);
      setResult(result);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    return () => {
      startedReloadAtRef.current = 0;
    };
  }, []);

  useEffect(() => {
    if (shouldStartLoad) {
      if (startedReloadAtRef.current) {
        return;
      }
      callback();
    } else {
      if (Date.now() - startedReloadAtRef.current < 200) {
        abort('dismiss too fast');
        startedReloadAtRef.current = 0;
        return;
      }
    }
  }, [shouldStartLoad]);

  return {
    result,
    loading,
    error,
    ref,
  };
}

/**
 * Wrap a function with abort controller.
 *
 * The abort method will be called when:
 * - User call from the returned `abort` function
 * - (Automatically) Component unmounted
 * - (Automatically) Re-call the function
 *
 * @param fn
 */
export function useSafeCallback<Fn extends (...args: any[]) => any> (fn: (signal: AbortSignal, ...args: Parameters<Fn>) => ReturnType<Fn>) {
  const acRef = useRef<AbortController>();
  const latestFn = useLatestValue(fn);

  const callback = useCallback((...args: Parameters<Fn>) => {
    if (acRef.current) {
      acRef.current?.abort('re-call');
    }
    const ac = acRef.current = new AbortController();

    return latestFn(ac.signal, ...args);
  }, []);

  useEffect(() => {
    return () => {
      acRef.current?.abort('unmount');
    };
  }, []);

  const abort = useCallback((reason?: any) => {
    acRef.current?.abort(reason);
  }, []);

  return {
    callback,
    abort,
  };
}
