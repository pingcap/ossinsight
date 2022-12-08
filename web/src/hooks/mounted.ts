import { RefObject, useCallback, useEffect, useRef } from 'react';

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
