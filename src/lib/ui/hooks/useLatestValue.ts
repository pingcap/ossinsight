import { useLatestRef } from './useLatestRef';

export function useLatestValue<T> (value: T) {
  return useLatestRef(value).current;
}
