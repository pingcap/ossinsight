import { getOwnerInfo } from '@/components/Analyze/utils';
import { notFound } from 'next/navigation';
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
