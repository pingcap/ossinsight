import { useMemo } from 'react';

function getBase () {
  if (typeof window === 'undefined') {
    return 'https://ossinsight.io';
  } else {
    return window.location.origin;
  }
}

export function getAdsLink (url: string, tracingName?: string, tracingValue?: string) {
  if (tracingName && tracingValue) {
    const res = new URL(url, /^https?:\/\//.test(url) ? undefined : getBase());
    res.searchParams.set(tracingName, tracingValue);
    return res.toString();
  } else {
    return url;
  }
}

export function useAdsLink (url: string, tracingName?: string, tracingValue?: string) {
  return useMemo(() => getAdsLink(url, tracingName, tracingValue), [url, tracingName, tracingValue]);
}
