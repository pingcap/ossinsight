import React, { useEffect } from 'react';

export interface BrowserHashProps {
  value?: string;
}

export default function BrowserHash ({ value }: BrowserHashProps) {
  useEffect(() => {
    history.replaceState(null, '', (value ? `#${value}` : location.pathname) + location.search);
  }, [value]);
  return <></>;
}
