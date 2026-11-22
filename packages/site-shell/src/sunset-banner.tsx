import { getCrossAppHref } from './site-links';
import type { SiteApp } from './types';

/** The day the live OSSInsight service is turned off. Change it here only. */
export const SUNSET_DATE_ISO = '2026-12-04';
export const SUNSET_DATE_LABEL = 'December 4, 2026';
export const SUNSET_ANNOUNCEMENT_PATH = '/blog/ossinsight-is-shutting-down';

/**
 * Site-wide shutdown notice. It sits above the sticky header and scrolls away
 * with the page, so layouts that depend on `--site-header-height` are unaffected.
 */
export function SunsetBanner({ app }: { app: SiteApp }) {
  const href = getCrossAppHref(app, 'docs', SUNSET_ANNOUNCEMENT_PATH);

  return (
    <div
      role="status"
      className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-[#ffe895] px-4 py-2 text-center text-[13.6px] leading-5 text-[#1a1a1b]"
    >
      <span>
        <strong>OSSInsight shuts down on {SUNSET_DATE_LABEL}.</strong>{' '}
        The site becomes a read-only archive, the API stops, and the dataset will be available to download.
      </span>
      <a href={href} className="font-semibold underline underline-offset-2">
        Read the announcement
      </a>
    </div>
  );
}
