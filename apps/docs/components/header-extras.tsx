'use client';

import { getCrossAppHref } from '@repo/site-shell';

export function HeaderSearchButton() {
  const webOrigin = getCrossAppHref('docs', 'web', '/');

  return (
    <a
      href={webOrigin}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#2a2a2b] px-4 py-1.5 text-sm text-gray-400 transition-colors hover:border-white/[0.14] hover:text-gray-300"
      style={{ minWidth: 180, maxWidth: '20rem' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <span>Search ...</span>
      <span className="ml-auto rounded-md border border-white/[0.08] bg-[#1a1a1b] px-1.5 py-0.5 text-xs text-gray-500">/</span>
    </a>
  );
}
