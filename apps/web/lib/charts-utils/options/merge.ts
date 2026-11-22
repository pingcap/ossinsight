import {deepmerge} from 'deepmerge-ts';

// Preserve the chart builders' partial-option typing while using a merger that
// handles prototype-named keys as data and never assigns an object's prototype.
export default function merge<T>(left: Partial<T>, right: Partial<T>): T;
export default function merge<T, U>(left: Partial<T>, right: Partial<U>): T & U;
export default function merge(left: object, right: object): object {
  return deepmerge(left, right);
}
