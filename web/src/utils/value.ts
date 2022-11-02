// TODO: inline functions https://www.npmjs.com/package/babel-plugin-inline-functions

export type Nullish<T> = T | null | undefined;
export type Falsy<T> = Nullish<T> | 0 | '' | false;

export function isNullish (v: any): v is null | undefined {
  return v == null;
}

export function notNullish<T> (v: T | Nullish<any>): v is T {
  return v != null;
}

export function isFalsy<T extends Falsy<any>> (v: T): v is Falsy<any> {
  // eslint-disable-next-line no-extra-boolean-cast
  return !Boolean(v);
}

export function notFalsy<T> (v: Falsy<T>): v is T {
  return Boolean(v);
}

export function isNumber (v: unknown): v is number {
  return typeof v === 'number';
}

export function isString (v: unknown): v is string {
  return typeof v === 'string';
}

export function isPositiveNumber (v: unknown): v is number {
  return isNumber(v) && v > 0;
}

export function isFiniteNumber (v: unknown): v is number {
  return isNumber(v) && isFinite(v);
}

export function coalescePositiveNumber (a: Nullish<number>, fallback: number): number {
  if (isPositiveNumber(a)) {
    return a;
  }
  return fallback;
}

export function coalesceFalsy<T, P> (value: T, fallback: P): T extends Falsy<any> ? P : T {
  // eslint-disable-next-line no-extra-boolean-cast
  return (Boolean(value) ? value : fallback) as never;
}

export function coalesceNullish<T, P> (value: T, fallback: P): T extends Nullish<any> ? P : T {
  return (isNullish(value) ? fallback : value) as never;
}
