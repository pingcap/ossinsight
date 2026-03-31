import { getOwnerInfo } from '@/components/Analyze/utils';
import { notFound } from 'next/navigation';
// React.cache deduplicates requests within a single render pass (RSC)
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
