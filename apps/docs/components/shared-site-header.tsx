'use client';

import { SiteHeader, RealtimeSummary, HeaderAnalyzeSelector, createAppHeaderConfig, getCrossAppHref } from '@repo/site-shell';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import clsx from 'clsx';

const headerConfig = createAppHeaderConfig('docs');
const webOrigin = getCrossAppHref('docs', 'web', '');
const webApiBase = `${webOrigin}/api/q`;
const ghApiBase = `${webOrigin}`;

export function SharedSiteHeader() {
  const pathname = usePathname();
  const isDocsHome = pathname === '/';
  const backgroundColor = isDocsHome ? '#212122' : '#1a1a1b';

  const navigateTo = useCallback((url: string) => {
    window.location.href = `${webOrigin}${url}`;
  }, []);

  return (
    <SiteHeader
      {...headerConfig}
      className={clsx(
        'border-b-0 shadow-none',
        isDocsHome ? 'bg-[#212122]' : 'bg-[#1a1a1b]',
      )}
      style={{ backgroundColor }}
      searchSlot={<HeaderAnalyzeSelector apiBase={ghApiBase} navigateTo={navigateTo} />}
    >
      <RealtimeSummary apiBase={webApiBase} />
    </SiteHeader>
  );
}
