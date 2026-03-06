import { withBarChartQuery } from '../withQuery';

export const ContributorsHistoryRemoteChart = withBarChartQuery('contributors-per-year', {
  categoryIndex: 'repo_name',
  valueIndex: 'contributors_count',
});
