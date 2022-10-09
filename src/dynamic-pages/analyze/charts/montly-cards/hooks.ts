import { useMemo } from "react";

export function useReversed<T>(source: T[]): T[] {
  return useMemo(() => [...source].reverse().map(item => {
    return { ...item, idx: 29 - (item as any).idx };
  }), [source]);
}
