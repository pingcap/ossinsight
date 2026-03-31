'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounces a reactive value. Built on an inline debounced-callback pattern
 * so that `packages/site-shell` stays self-contained (no cross-package import).
 *
 * The canonical debounce primitive lives in
 * `apps/web/components/ui/hooks/useDebouncedCallback.ts`.
 */
export function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const handle = useRef<ReturnType<typeof setTimeout>>();

  const update = useCallback(
    (v: T) => {
      clearTimeout(handle.current);
      handle.current = setTimeout(() => setDebouncedValue(v), delay);
    },
    [delay],
  );

  useEffect(() => {
    update(value);
  }, [value, update]);

  useEffect(() => {
    return () => clearTimeout(handle.current);
  }, []);

  return debouncedValue;
}
