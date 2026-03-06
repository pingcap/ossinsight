import { useMemo } from 'react';

export function useDimension<T, K extends keyof T = any> (data: T[], dimension: K): Array<T[K]> {
  return useMemo(() => {
    return Array.from(data.reduce((set, item) => set.add(item[dimension]), new Set<T[K]>()));
  }, [data, dimension]);
}
