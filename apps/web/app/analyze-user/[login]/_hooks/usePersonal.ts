'use client';

import { queryAPI } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type RequestMap = {
  'personal-contribution-time-distribution': { dayofweek: number; hour: number; cnt: number; type: string };
  'personal-contribution-trends': { contribution_type: ContributionType; event_month: string; cnt: number };
  'personal-contributions-for-repos': { repo_id: number; repo_name: string; type: string; cnt: number };
  'personal-issues-history': { event_month: string; issues: number; issue_comments: number };
  'personal-languages': { language: string; prs: number; percentage: number };
  'personal-pull-request-action-history': { event_month: string; opened_prs: number; merged_prs: number };
  'personal-pull-request-size-history': { event_month: string; xs: number; s: number; m: number; l: number; xl: number; xxl: number; all_size: number };
  'personal-pull-request-code-changes-history': { event_month: number; additions: number; deletions: number; changes: number };
  'personal-pull-request-reviews-history': { event_month: string; reviews: number; review_comments: number };
  'personal-pushes-and-commits': { event_month: string; pushes: number; commits: number };
  'personal-star-history': { star_month: string; language: string; cnt: number; percentage: number };
  'personal-contribution-in-diff-repos': { cnt: number; event_period: string; repo_id: number; repo_name: string };
};

export type ContributionType = 'issues' | 'issue_comments' | 'pull_requests' | 'reviews' | 'review_comments' | 'pushes';
export const contributionTypes: ContributionType[] = ['issues', 'pull_requests', 'reviews', 'pushes', 'review_comments', 'issue_comments'];

export type PersonalOverview = {
  user_id: number;
  repos: number;
  star_repos: number;
  star_earned: number;
  contribute_repos: number;
  issues: number;
  pull_requests: number;
  code_reviews: number;
  code_additions: number;
  code_deletions: number;
};

export function usePersonalData<K extends keyof RequestMap> (key: K, userId: number | undefined, params: Record<string, any> = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['personal', key, userId, params],
    queryFn: ({ signal }) => queryAPI<RequestMap[K]>(key, { userId, ...params }, signal),
    enabled: userId != null && userId > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data?.data as RequestMap[K][] | undefined,
    sql: data?.sql as string | undefined,
    queryName: data?.query as string | undefined,
    loading: isLoading,
    error,
  };
}

export function usePersonalOverview (userId: number | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['personal', 'personal-overview', userId],
    queryFn: ({ signal }) => queryAPI<PersonalOverview>('personal-overview', { userId }, signal),
    enabled: userId != null && userId > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: (data?.data as PersonalOverview[] | undefined)?.[0],
    loading: isLoading,
    error,
  };
}

export type ContributionActivityType = 'all' | ContributionType;
export type ContributionActivityRange = 'last_7_days' | 'last_72_hours' | 'last_28_days';

export const contributionActivityTypes: Array<{ key: ContributionActivityType; label: string }> = [
  { key: 'all', label: 'All Contributions' },
  { key: 'pushes', label: 'Pushes' },
  { key: 'pull_requests', label: 'Pull Requests' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'review_comments', label: 'Review Comments' },
  { key: 'issues', label: 'Issues' },
  { key: 'issue_comments', label: 'Issue Comments' },
];

export const contributionActivityRanges: Array<{ key: ContributionActivityRange; label: string }> = [
  { key: 'last_72_hours', label: 'Last 3 days' },
  { key: 'last_7_days', label: 'Last Week' },
  { key: 'last_28_days', label: 'Last Month' },
];

export type ContributionActivity = { cnt: number; event_period: string; repo_id: number; repo_name: string };

export function usePersonalContributionActivities (userId: number | undefined, type: ContributionActivityType, timeRange: ContributionActivityRange) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['personal', 'personal-contribution-in-diff-repos', userId, type, timeRange],
    queryFn: ({ signal }) => queryAPI<ContributionActivity>('personal-contribution-in-diff-repos', {
      userId,
      activity_type: type,
      time_range: timeRange,
      period: timeRange === 'last_28_days' ? 'day' : 'hour',
    }, signal),
    enabled: userId != null && userId > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data?.data as ContributionActivity[] | undefined,
    sql: data?.sql as string | undefined,
    queryName: data?.query as string | undefined,
    loading: isLoading,
    error,
  };
}

export function useRange (range: ContributionActivityRange): [Date, Date] {
  return useMemo(() => {
    const date = new Date();
    date.setMinutes(0, 0, 0);
    let diff: number;
    switch (range) {
      case 'last_72_hours':
        diff = 72 * 60 * 60 * 1000;
        break;
      case 'last_7_days':
        diff = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'last_28_days':
        diff = 28 * 24 * 60 * 60 * 1000;
        break;
    }
    return [new Date(date.getTime() - diff), date];
  }, [range]);
}

export type Personal<T extends keyof RequestMap> = RequestMap[T];
