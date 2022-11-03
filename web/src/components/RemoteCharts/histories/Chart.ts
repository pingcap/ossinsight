import { withBarChartQuery } from '../withQuery';
import { Query } from './Form';
import React, { useMemo } from 'react';
import { Queries } from '../queries';

export const EventsHistoryRemoteChart = withBarChartQuery('events-history', {
  categoryIndex: 'repo_name',
  valueIndex: 'events_count',
});

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>;
}

export const Chart = ({ category, valueIndex, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withBarChartQuery(category, {
      categoryIndex: 'repo_name',
      valueIndex,
    });
  }, [category, valueIndex]);

  return React.createElement(Chart, props);
};
