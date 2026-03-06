export type EventTypeOption = { key: string; title: string };

/// according to pingcap/ossinsight:configs/queries/personal-contribution-in-diff-repos/params.json

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    key: 'pull_requests',
    title: 'PRs Opened'
  },
  {
    key: 'reviews',
    title: 'PRs Reviews'
  },
  {
    key: 'review_comments',
    title: 'PR Review Comments'
  },
  {
    key: 'issues',
    title: 'Issues Opened'
  },
  {
    key: 'issue_comments',
    title: 'Issue Comments'
  },
  {
    key: 'pushes',
    title: 'Pushes'
  },
  {
    key: 'all',
    title: 'All'
  },
];
