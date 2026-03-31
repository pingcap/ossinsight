'use client';

import { useEffect, useState } from 'react';
import { useDebouncedCallback } from '@/components/ui/hooks/useDebouncedCallback';

export function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const updateValue = useDebouncedCallback(
    (v: T) => setDebouncedValue(v),
    { timeout: delay },
  );

  useEffect(() => {
    updateValue(value);
  }, [value, updateValue]);

  return debouncedValue;
}
