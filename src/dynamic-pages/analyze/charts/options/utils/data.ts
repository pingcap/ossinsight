// https://stackoverflow.com/questions/49752151/typescript-keyof-returning-specific-type
export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any
}

export function range<T extends Record<string, any>, K extends KeyOfType<T, number>>(data: T[], keys: K[]): [min: number, max: number] | undefined {
  if (data.length === 0) {
    return undefined;
  }
  return data.reduce((prev, curr) => {
    let res: [number, number] = [...prev];
    for (let key of keys) {
      const val = curr[key];
      res[0] = Math.min(val, res[0]);
      res[1] = Math.max(val, res[1]);
    }
    return res;
  }, [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]);
}
