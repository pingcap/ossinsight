import { getOwnerInfo } from '@/components/Analyze/utils';
import { notFound } from 'next/navigation';
// React.cache deduplicates requests within a single render pass (RSC)
// @ts-expect-error - React 18.2 types don't export cache, but it exists at runtime
import { cache } from 'react';

export const fetchOwnerInfo = cache(async (
  orgName: string,
) => {
  try {
    return await getOwnerInfo(orgName);
  } catch (error) {
    notFound();
  }
});
