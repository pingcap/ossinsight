import { AsyncData, RemoteData, useRemoteData } from '../../../components/RemoteCharts/hook';
import { useMemo } from 'react';
import { notNullish } from '@site/src/utils/value';

type RequestMap = {
  'personal-contribution-time-distribution': { dayofweek: number, hour: number, cnt: number, type: string };
  'personal-contribution-trends': { contribution_type: ContributionType, event_month: string, cnt: number };
  'personal-contributions-for-repos': { repo_id: number, repo_name: string, type: string, cnt: number };
  'personal-issues-history': { event_month: string, issues: number, issue_comments: number };
  'personal-languages': { language: string, prs: number, percentage: number };
  // 'personal-overview': never
  'personal-pull-request-action-history': { event_month: string, opened_prs: number, merged_prs: number };
  'personal-pull-request-size-history': { event_month: string, xs: number, s: number, m: number, l: number, xl: number, xxl: number, all_size: number };
  'personal-pull-request-code-changes-history': { event_month: number, additions: number, deletions: number, changes: number };
  'personal-pull-request-reviews-history': { event_month: string, reviews: number, review_comments: number };
  'personal-pushes-and-commits': { event_month: string, pushes: number, commits: number };
  'personal-star-history': { star_month: string, language: string, cnt: number, percentage: number };
};

type ContributionType = 'issues' | 'issue_comments' | 'pull_requests' | 'reviews' | 'review_comments' | 'pushes';

export const contributionTypes: ContributionType[] = ['issues', 'pull_requests', 'reviews', 'pushes', 'review_comments', 'issue_comments'];

type PersonalDataParams = { userId: number };

export function usePersonalData<K extends keyof RequestMap> (key: K, userId: number | undefined, run: boolean, params: any = {}) {
  return useRemoteData<PersonalDataParams, RequestMap[K]>(key, { userId, ...params }, false, notNullish(userId) && run);
}

export type PersonalOverview = {
  user_id: number;
  latest_login: string;
  user_logins: string;
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

export function usePersonalOverview (userId: number | undefined, run: boolean): AsyncData<PersonalOverview> {
  const {
    data,
    loading,
    error,
  } = useRemoteData<PersonalDataParams, PersonalOverview>('personal-overview', { userId } as any, false, notNullish(userId) && run);

  return {
    data: data?.data[0],
    loading,
    error,
  };
}

export type ContributionActivityType = 'all' | ContributionType;
export type ContributionActivityPeriod = 'hour' | 'day' | 'month';
export type ContributionActivityRange = 'last_7_days' | 'last_72_hours' | 'last_28_days';
export const contributionActivityTypes: Array<{ key: ContributionActivityType, label: string }> = [
  { key: 'all', label: 'All Contributions' },
  { key: 'pushes', label: 'Pushes' },
  { key: 'pull_requests', label: 'Pull Requests' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'review_comments', label: 'Review Comments' },
  { key: 'issues', label: 'Issues' },
  { key: 'issue_comments', label: 'Issue Comments' },
];
export const contributionActivityRanges: Array<{ key: ContributionActivityRange, label: string }> = [
  { key: 'last_72_hours', label: 'Last 3 days' },
  { key: 'last_7_days', label: 'Last Week' },
  { key: 'last_28_days', label: 'Last Month' },
];
export type ContributionActivity = { cnt: number, event_period: string, repo_id: number, repo_name: string };

export function usePersonalContributionActivities (userId: number | undefined, type: ContributionActivityType, timeRange: ContributionActivityRange, run: boolean): AsyncData<RemoteData<any, ContributionActivity>> {
  return useRemoteData<any, ContributionActivity>('personal-contribution-in-diff-repos', {
    userId,
    activity_type: type,
    time_range: timeRange,
    period: timeRange === 'last_28_days' ? 'day' : 'hour',
  }, false, notNullish(userId) && run);
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
