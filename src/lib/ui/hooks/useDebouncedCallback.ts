import { useCallback, useEffect, useRef } from 'react';
import { useLatestValue } from './useLatestValue';

export type DebouncedOptions = {
  timeout: number
}

export function useDebouncedCallback<Fn extends (...args: any[]) => void> (fn: Fn, { timeout }: DebouncedOptions) {
  const debouncedHandle = useRef<ReturnType<typeof setTimeout>>();
  fn = useLatestValue(fn);

  const debouncedFn = useCallback((...params: Parameters<Fn>) => {
    clearTimeout(debouncedHandle?.current);

    debouncedHandle.current = setTimeout(() => {
      fn(...params);
    }, timeout);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(debouncedHandle.current);
    };
  }, []);

  return debouncedFn;
}
