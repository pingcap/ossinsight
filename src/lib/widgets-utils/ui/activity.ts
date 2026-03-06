export type ActivityTypeOption = { key: string; title: string };
export const PARTICIPANTS_ROLES_OPTIONS: ActivityTypeOption[] = [
  {
    key: 'pr_creators',
    title: 'Pull Request Creators',
  },
  {
    key: 'pr_reviewers',
    title: 'Pull Request Reviewers',
  },
  {
    key: 'pr_commenters',
    title: 'Pull Request Commenters',
  },
  {
    key: 'issue_creators',
    title: 'Issue Creators',
  },
  {
    key: 'issue_commenters',
    title: 'Issue Commenters',
  },
  {
    key: 'commit_authors',
    title: 'Commit Authors',
  },
  {
    key: 'participants',
    title: 'Participants',
  },
];

export const ACTIVITY_TYPE_OPTIONS: ActivityTypeOption[] = [
  {
    key: 'stars',
    title: 'Stars',
  },
  {
    key: 'pull-requests',
    title: 'Pull Requests',
  },
  {
    key: 'pull-request-creators',
    title: 'Pull Requests Creators',
  },
  {
    key: 'issues',
    title: 'Issues',
  },
  {
    key: 'issue-creators',
    title: 'Issue Creators',
  },
  {
    key: 'issue-closed-ratio',
    title: 'Issue Closed Ratio',
  },
  {
    key: 'pr-merged-ratio',
    title: 'Pull Request Merged Ratio',
  },
  {
    key: 'pr-reviewed-ratio',
    title: 'Pull Request Reviewed Ratio',
  },
  {
    key: 'activities',
    title: 'Activities',
  },
  {
    key: 'participants',
    title: 'Participants',
  },
  {
    key: 'code-submissions',
    title: 'Code Submissions',
  },
  {
    key: 'active',
    title: 'Active',
  },
  {
    key: 'new',
    title: 'New',
  },
  {
    key: 'repos',
    title: 'Repos',
  },
  {
    key: 'commits',
    title: 'Commits',
  },
  {
    key: 'pull-requests/merged',
    title: 'Pull Requests - Merged',
  },
  {
    key: 'pull-requests/self-merged',
    title: 'Pull Requests - Self-Merged',
  },
  {
    key: 'issues/closed',
    title: 'Issues - Closed',
  },
  {
    key: 'issues/issue-comments',
    title: 'Issues - Issue Comments',
  },
  {
    key: 'reviews/reviewed',
    title: 'Pull Requests - Reviewed',
  },
  {
    key: 'reviews/review-prs',
    title: 'Pull Requests - Review PRs',
  },
  {
    key: 'reviews/review-comments',
    title: 'Pull Requests - Review Comments',
  },
  {
    key: 'reviews',
    title: 'Reviews',
  },
  ...PARTICIPANTS_ROLES_OPTIONS,
];

export function activityDisplayName(key: string) {
  return ACTIVITY_TYPE_OPTIONS.find((a) => a.key === key)?.title ?? 'Unknown';
}
