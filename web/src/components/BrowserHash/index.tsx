import React, { useEffect } from 'react';

export interface BrowserHashProps {
  value?: string;
}

export default function BrowserHash ({ value }: BrowserHashProps) {
  useEffect(() => {
    history.replaceState(null, '', location.search + (value ? `#${value}` : location.pathname));
  }, [value]);
  return <></>;
}
