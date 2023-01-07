import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { isNonemptyString, isNullish, notFalsy, notNullish, Nullish } from '@site/src/utils/value';

export interface UseUrlSearchStateProps<T> {
  defaultValue: T | (() => T);
  serialize: (value: T) => string | Nullish;
  deserialize: (string: string) => T;
}

export type UseUrlSearchStateHook = <T> (key: string, props: UseUrlSearchStateProps<T>, push?: boolean) => [T, Dispatch<SetStateAction<T>>];

function useUrlSearchStateSSR<T> (key: string, { defaultValue }: UseUrlSearchStateProps<T>): [T, Dispatch<SetStateAction<T>>] {
  return [...useState<T>(defaultValue)];
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
  const historyChangeRef = useRef(true);
  const internalChange = useRef(false);

  useEffect(() => {
    historyChangeRef.current = false;
  }, []);

  useEffect(() => {
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    const sv = serialize(value);
    const usp = new URLSearchParams(location.search);
    if (isNullish(sv)) {
      if (!usp.has(key)) {
        return;
      }
      usp.delete(key);
    } else {
      if (usp.get(key) === sv) {
        return;
      }
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

  useEffect(() => {
    const handlePopstate = () => {
      internalChange.current = true;
      const usp = new URLSearchParams(location.search);
      const value = usp.get(key);
      historyChangeRef.current = true;
      if (notNullish(value)) {
        setValue(deserialize(value));
      } else {
        setValue(defaultValue);
      }
      setTimeout(() => {
        historyChangeRef.current = false;
      }, 0);
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

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

export function nullableStringParam (defaultValue?: string): UseUrlSearchStateProps<string | undefined> {
  return {
    defaultValue,
    serialize: value => isNonemptyString(value) ? value : undefined,
    deserialize: value => isNonemptyString(value) ? value : undefined,
  };
}

export function booleanParam (trueValue = 'true'): UseUrlSearchStateProps<boolean> {
  return {
    defaultValue: () => false,
    serialize: value => notFalsy(value) ? trueValue : undefined,
    deserialize: value => Boolean(value === trueValue),
  };
}
