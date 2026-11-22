'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

/** Preserve old shared fragment URLs after sanitization namespaces heading IDs. */
export function LegacyMarkdownAnchors() {
  const pathname = usePathname();
  useEffect(() => {
    const scroll = () => {
      try {
        const fragment = decodeURIComponent(window.location.hash.slice(1));
        if (!fragment || document.getElementById(fragment)) return;
        document.getElementById(`user-content-${fragment}`)?.scrollIntoView();
      } catch { /* Invalid URL escapes do not identify an anchor. */ }
    };
    scroll();
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, [pathname]);
  return null;
}
