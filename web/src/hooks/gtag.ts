import { useCallback } from 'react';
import { unstable_serialize } from 'swr';

export function useGtagEventDispatcher (eventName: string, defaultConfig: object = {}) {
  return useCallback((config?: object) => {
    globalThis.gtag('event', eventName, { ...defaultConfig, ...config });
  }, [eventName, unstable_serialize(defaultConfig)]);
}
