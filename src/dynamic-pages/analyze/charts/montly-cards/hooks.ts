import { useMemo } from "react";

export function useReversed<T>(source: T[]): T[] {
  return useMemo(() => [...source].reverse().map(item => {
    return { ...item, idx: 29 - (item as any).idx };
  }), [source]);
}

export function usePartData(data: any[], part: 'current' | 'last', valueKey: string, dayKey: string) {
  return useMemo(() => data.map(data => ({
    idx: data.idx,
    day: data[`${part}_${dayKey}`],
    value: data[`${part}_${valueKey}`],
  })), [data]);
}

export function useDiff(data: any[], valueKey: string, dayKey: string) {
  const item = data[0]
  if (!item) {
    return '0'
  }
  if (!item[`last_${valueKey}`]) {
    return '';
  }
  return ((item[`current_${valueKey}`] - item[`last_${valueKey}`]) / item[`last_${valueKey}`] * 100).toFixed(0) + '%'
}
