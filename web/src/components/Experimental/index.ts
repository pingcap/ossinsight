import { useCallback, useEffect, useState } from 'react';
import globalData from '@generated/globalData';
import { isNonemptyString } from '@site/src/utils/value';

const { defaultEnabled } = globalData['experimental-features'].default as { defaultEnabled: string[] };

export const STORAGE_KEY = 'ossinsight.experimental-features';

export function useExperimental (feature: string) {
  const [enabled, setEnabled] = useState(() => defaultEnabled.includes(feature));

  useEffect(() => {
    const flag = localStorage.getItem(STORAGE_KEY) ?? '';
    const flags = flag.split(',');
    if (flags.includes(feature)) {
      setEnabled(true);
    }
    if (flags.includes(`!${feature}`)) {
      setEnabled(false);
    }
  }, [feature]);

  const enable = useCallback((newValue: boolean) => {
    const flag = localStorage.getItem(STORAGE_KEY) ?? '';
    const flags = flag.split(',').filter(flag => isNonemptyString(flag) && flag !== feature && flag !== `!${feature}`);
    const newFlags = flags.concat(newValue ? feature : `!${feature}`);
    localStorage.setItem(STORAGE_KEY, newFlags.join(','));
    setEnabled(newValue);
  }, [feature]);

  return [enabled, enable] as const;
}

export interface ExperimentalProps {
  children: JSX.Element;
  fallback?: JSX.Element | null;
  feature: string;
}

export function Experimental ({ feature, fallback = null, children }: ExperimentalProps) {
  const [enabled] = useExperimental(feature);
  if (enabled) {
    return children;
  } else {
    return fallback;
  }
}
