import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

export function useMounted (): RefObject<boolean> {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

/**
 * Some async operation would change the unmounted component's state. This function provide a
 * convenience method to prevent such functions to be called.
 */
export function useWhenMounted (): <T extends (...args: any[]) => void>(fn: T) => T {
  const mounted = useMounted();

  return useCallback(<T extends (...args: any[]) => void> (fn: T) => {
    return function () {
      if (mounted.current) {
        fn.apply(this, arguments);
      }
    } as T;
  }, []);
}

/**
 * will clear previous setTimeout
 */
export function useSafeSetTimeout (): typeof setTimeout {
  const mountedRef = useRef(false);
  const handleRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(handleRef.current);
    };
  }, []);

  return useMemoizedFn(<TArgs extends any[]> (func: (...args: TArgs) => any, timeout?: number, ...args: TArgs) => {
    clearTimeout(handleRef.current);
    const h = setTimeout((...args) => {
      if (mountedRef.current) {
        func(...args);
      }
    }, timeout, ...args);

    handleRef.current = h;
    return h;
  }) as typeof setTimeout;
}
