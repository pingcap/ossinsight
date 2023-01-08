// TODO: inline functions https://www.npmjs.com/package/babel-plugin-inline-functions

export type Nullish = null | undefined;
export type Falsy = Nullish | 0 | '' | false;

export function isNullish (v: any): v is null | undefined {
  return v == null;
}

export function notNullish<T> (v: T): v is Exclude<T, Nullish> {
  return v != null;
}

export function isFalsy<T> (v: T): v is T & Falsy {
  // eslint-disable-next-line no-extra-boolean-cast
  return !Boolean(v);
}

export function notFalsy<T> (v: T): v is Exclude<T, Falsy> {
  return Boolean(v);
}

export function isNumber (v: unknown): v is number {
  return typeof v === 'number';
}

export function isString (v: unknown): v is string {
  return typeof v === 'string';
}

export function isNonemptyString (v: unknown): v is string {
  return isString(v) && v !== '';
}

export function isBlankString (v: unknown): v is string {
  return isString(v) && v.trim() === '';
}

export function isPositiveNumber (v: unknown): v is number {
  return isNumber(v) && v > 0;
}

export function isFiniteNumber (v: unknown): v is number {
  return isNumber(v) && isFinite(v);
}

export function coalescePositiveNumber (a: number | Nullish, fallback: number): number {
  if (isPositiveNumber(a)) {
    return a;
  }
  return fallback;
}

export function coalesceFalsy<T, P> (value: T, fallback: P): T extends Falsy ? P : T {
  // eslint-disable-next-line no-extra-boolean-cast
  return (Boolean(value) ? value : fallback) as never;
}

export function coalesceNullish<T, P> (value: T, fallback: P): T extends Nullish ? P : T {
  return (isNullish(value) ? fallback : value) as never;
}

export function isEmptyArray<T> (value: T[] | Nullish): boolean {
  if (isNullish(value)) {
    return true;
  }
  if (value instanceof Array) {
    return value.length === 0;
  } else {
    return false;
  }
}

export function nonEmptyArray<T> (value: T[] | Nullish): value is T[] {
  if (isNullish(value)) {
    return false;
  }
  if (value instanceof Array) {
    return value.length > 0;
  } else {
    return false;
  }
}

export function allSatisfy<T, Condition extends (value: T) => boolean> (arr: T[], condition: Condition): boolean {
  return arr.reduce((previousValue, currentValue) => previousValue && condition(currentValue), true);
}
