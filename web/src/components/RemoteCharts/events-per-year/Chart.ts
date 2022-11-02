import { withBarChartQuery } from '../withQuery';

export const EventsHistoryRemoteChart = withBarChartQuery('events-per-year', {
  categoryIndex: 'repo_name',
  valueIndex: 'events_count',
});
