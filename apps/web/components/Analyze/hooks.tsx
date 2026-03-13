'use client';

import { usePerformanceOptimizedNetworkRequest } from '@/utils/usePerformanceOptimizedNetworkRequest';
import { useEffect } from 'react';
import * as React from 'react';

import { getOrgOverview, getUserInfo } from '@/components/Analyze/utils';

export interface OrgOverviewDataProps {
  participants: number;
  stars: number;
  last_event_at: string;
}

export function useOrgOverview(id: number) {
  const { result: data, loading, error, ref } = usePerformanceOptimizedNetworkRequest(getOrgOverview, id);

  useEffect(() => {
    ref(document.body);
    return () => {
      ref(null);
    }
  }, []);

  return {
    loading,
    data: data?.[0],
    error,
    ref,
  };
}
