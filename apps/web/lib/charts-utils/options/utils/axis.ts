import _ from 'lodash';

import { KeyOfType, range } from './data';

export function upBound(num: number): number {
  if (num === 0) {
    return 0;
  }

  const sign = Math.sign(num);
  const mag = Math.abs(num);

  let base = 1;
  while (mag > base) {
    base *= 10;
  }
  base /= 20;

  return (Math.floor(mag / base) + 1) * base * sign;
}

export function adjustAxis<T extends Record<string, any>>(
  data: T[],
  keys: Array<Array<KeyOfType<T, number>>>
): Array<{ min: number; max: number }> {
  if (data.length === 0) {
    return keys.map(() => ({
      min: 0,
      max: 0,
    }));
  }
  const ranges = keys.map((key) => range(data, key));

  const hasNegative = ranges.reduce(
    (prev, current) => prev || (!_.isNull(current) && current[1] >= 0),
    false
  );
  const hasPositive = ranges.reduce(
    (prev, current) => prev || (!_.isNull(current) && current[0] <= 0),
    false
  );

  if (!hasNegative || !hasPositive) {
    return keys.map(() => ({
      min: 0,
      max: 0,
    }));
  }

  let r = Infinity;
  const rList: Array<number | undefined> = [];

  for (const range of ranges) {
    if (!_.isNull(range)) {
      const [min, max] = range;
      rList.push(r);
      const prev = Math.min(Math.abs(r - 1));
      const curr = Math.max(max / -min - 1);
      if (curr < prev) {
        r = max / -min;
      }
    } else {
      rList.push(undefined);
    }
  }

  return ranges.map((range) => {
    if (range) {
      const [min, max] = range;
      return {
        min: upBound(Math.min(min, -max / r)),
        max: upBound(Math.max(max, -min * r)),
      };
    } else {
      return {
        min: 0,
        max: 0,
      };
    }
  });
}
