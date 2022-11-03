import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { notNullish, Nullish } from '@site/src/utils/value';

export interface UseUrlSearchStateProps<T> {
  defaultValue: T | (() => T);
  serialize: (value: T) => string | Nullish;
  deserialize: (string: string) => T;
}

export type UseUrlSearchStateHook = <T> (key: string, props: UseUrlSearchStateProps<T>) => [T, Dispatch<SetStateAction<T>>];

function useUrlSearchStateSSR<T> (key: string, { defaultValue }: UseUrlSearchStateProps<T>): [T, Dispatch<SetStateAction<T>>] {
  return useState<T>(defaultValue);
}

function useUrlSearchStateCSR<T> (key: string, {
  defaultValue,
  deserialize,
  serialize,
}: UseUrlSearchStateProps<T>, push: boolean = false): [T, Dispatch<SetStateAction<T>>] {
  const initialValue = useMemo(() => {
    const usp = new URLSearchParams(location.search);
    const v = usp.get(key);
    if (notNullish(v)) {
      return deserialize(v);
    } else {
      return defaultValue;
    }
  }, []);
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    const sv = serialize(value);
    const usp = new URLSearchParams(location.search);
    if (sv === undefined || sv === null) {
      usp.delete(key);
    } else {
      usp.set(key, sv);
    }
    const uspStr = usp.toString();
    const search = uspStr ? `?${uspStr}` : '';
    const hash = location.hash ? `${location.hash}` : '';
    const url = location.pathname + search + hash;
    if (push) {
      window.history.pushState(null, '', url);
    } else {
      window.history.replaceState(null, '', url);
    }
  }, [value]);

  return [value, setValue];
}

const useUrlSearchState: UseUrlSearchStateHook = typeof window === 'undefined' ? useUrlSearchStateSSR : useUrlSearchStateCSR;

export default useUrlSearchState;

export function stringParam (defaultValue?): UseUrlSearchStateProps<string> {
  return {
    defaultValue,
    serialize: s => s,
    deserialize: s => s,
  };
}
