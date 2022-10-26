import {AsyncData, RemoteData} from '../../../../../components/RemoteCharts/hook';
import {KeyOfType, range} from './data';
import { upBound } from "../../utils";

export function adjustAxis<T extends Record<string, any>>(data: T[], keys: KeyOfType<T, number>[][]): { min?: number, max?: number }[] {
  if (!data.length) {
    return keys.map(() => ({}));
  }
  const ranges = keys.map(key => range(data, key));

  const hasNegative = ranges.reduce((prev, current) => (prev || current[1] >= 0), false);
  const hasPositive = ranges.reduce((prev, current) => (prev || current[0] <= 0), false);

  if (!hasNegative || !hasPositive) {
    return keys.map(() => ({}));
  }

  let r = Infinity
  let rList: (number|undefined)[] = []

  for (const range of ranges) {
    const [min, max] = range
    if (min < 0 && max > 0) {
      rList.push(r)
      const prev = Math.min(Math.abs(r - 1))
      const curr = Math.max(max / -min - 1)
      if (curr < prev) {
        r = max / -min
      }
    } else {
      rList.push(undefined)
    }
  }

  return ranges.map(([min, max]) => ({
    min: upBound(Math.min(min, -max / r)),
    max: upBound(Math.max(max, -min * r))
  }))
}


