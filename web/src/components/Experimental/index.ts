import { useEffect, useState } from 'react';
import globalData from '@generated/globalData';

const { defaultEnabled } = globalData['experimental-features'].default as { defaultEnabled: string[] };

export function useExperimental (feature: string) {
  const [enabled, setEnabled] = useState(() => defaultEnabled.includes(feature));

  useEffect(() => {
    const flag = localStorage.getItem('ossinsight.experimental-features') ?? '';
    const flags = flag.split(',');
    if (flags.includes(feature)) {
      setEnabled(true);
    }
    if (flags.includes(`!${feature}`)) {
      setEnabled(false);
    }
  }, []);

  return enabled;
}

export interface ExperimentalProps {
  children: JSX.Element;
  feature: string;
}

export function Experimental ({ feature, children }: ExperimentalProps) {
  const enabled = useExperimental(feature);
  if (enabled) {
    return children;
  } else {
    return null;
  }
}
