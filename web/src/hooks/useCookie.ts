import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';
import { isFunction, isString } from 'ahooks/es/utils';
import { isFiniteNumber } from '@site/src/utils/value';

export type State = string | undefined;

export interface Options extends Cookies.CookieAttributes {
  defaultValue?: State | (() => State);
  pollInterval?: number;
}

export default function usePollingCookieState (cookieKey: string, options: Options = {}) {
  const getCookie = useCallback(() => {
    const cookieValue = Cookies.get(cookieKey);

    if (isString(cookieValue)) return cookieValue;

    if (isFunction(options.defaultValue)) {
      return options.defaultValue();
    }

    return options.defaultValue;
  }, []);

  const [state, setState] = useState<State>(getCookie);

  const updateState = useCallback((
    newValue: State | ((prevState: State) => State),
    newOptions: Cookies.CookieAttributes = {},
  ) => {
    const { defaultValue, pollInterval, ...restOptions } = { ...options, ...newOptions };
    setState((prevState) => {
      const value = isFunction(newValue) ? newValue(prevState) : newValue;
      if (value === undefined) {
        Cookies.remove(cookieKey);
      } else {
        Cookies.set(cookieKey, value, restOptions);
      }
      return value;
    });
  }, []);

  useEffect(() => {
    if (isFiniteNumber(options.pollInterval) && options.pollInterval > 0) {
      const h = setInterval(() => {
        setState(getCookie());
      }, options.pollInterval);

      return () => {
        clearInterval(h);
      };
    }
  }, []);

  return [state, updateState] as const;
}
