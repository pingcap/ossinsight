import { notNullish } from '@site/src/utils/value';

export function array (n: number) {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = i;
  }
  return arr;
}

export function randomOf<T> (source: T[], excludeIndex?: number): T | undefined {
  if (source.length === 0) {
    return undefined;
  }
  if (source.length === 1) {
    if (notNullish(excludeIndex) && excludeIndex === 0) {
      return undefined;
    }
  }
  while (true) {
    const rand = Math.floor((Math.random() - 0.00001) * source.length);
    if (rand === excludeIndex) {
      continue;
    }
    return source[rand];
  }
}

export function uniqueItems<T> (...items: Array<Iterable<T>>): T[] {
  const set = new Set<T>();
  const res: T[] = [];
  items.forEach(arr => {
    for (const item of arr) {
      if (!set.has(item)) {
        set.add(item);
        res.push(item);
      }
    }
  });
  return res;
}
