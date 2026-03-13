'use client';

import { RealtimeSummary as SharedRealtimeSummary } from '@repo/site-shell';

export function RealtimeSummary() {
  return <SharedRealtimeSummary apiBase="/api/q" />;
}
