import { AsyncData, RemoteData, useRemoteData } from '../../../components/RemoteCharts/hook';

type RequestMap = {
  'personal-contribution-time-distribution': { dayofweek: number, hour: number, cnt: number, type: string }
  'personal-contribution-trends': { contribution_type: ContributionType, event_month: string, cnt: number }
  'personal-contributions-for-repos': { repo_id: number, repo_name: string, type: string, cnt: number }
  'personal-issues-history': { event_month: string, issues: number, issues_comments: number }
  'personal-languages': { language: string, prs: number, percentage: number }
  // 'personal-overview': never
  'personal-pull-request-action-history': { event_month: string, opened_prs: number, merged_prs: number }
  'personal-pull-request-size-history': { event_month: string, xs: number, s: number, m: number, l: number, xl: number, xxl: number, all_size: number }
  'personal-pull-reuqest-code-changes-history': { event_month: number, additions: number, deletions: number, changes: number }
  'personal-pull-reuqest-reviews-history': { event_month: string, reviews: number, review_comments: number }
  'personal-pushes-and-commits': { event_month: string, pushes: number, commits: number }
  'personal-star-history': { star_month: string, language: string, cnt: string, percentage: number }
}

type ContributionType = 'issues' | 'issue_comments' | 'pull_requests' | 'reviews' | 'review_comments' | 'pushes'

export const contributionTypes: ContributionType[] = ['issues', 'issue_comments', 'pull_requests', 'reviews', 'review_comments', 'pushes']

type PersonalDataParams = { userId: number }

export function usePersonalData<K extends keyof RequestMap>(key: K, userId: number | undefined, run: boolean) {
  return useRemoteData<PersonalDataParams, RequestMap[K]>(key, { userId }, false, !!userId && run)
}

export type PersonalOverview = {
  user_id: number
  latest_login: string
  user_logins: string
  repos: number
  star_repos: number
  star_earned: number
  contribute_repos: number
  issues: number
  pull_requests: number
  code_reviews: number
  code_additions: number
  code_deletions: number
}

export function usePersonalOverview(userId: number | undefined, run: boolean): AsyncData<PersonalOverview> {
  const { data, loading, error } = useRemoteData<PersonalDataParams, PersonalOverview>('personal-overview', { userId }, false, !!userId && run)

  return {
    data: data?.data[0],
    loading,
    error,
  }
}

export type Personal<T extends keyof RequestMap> = RequestMap[T]
