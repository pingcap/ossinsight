import { withZScoreChartQuery } from '../withQuery';
import { Query } from './Form';
import React, { useMemo } from 'react';
import { Queries } from '../queries';

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>;
}

export const Chart = ({ category, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withZScoreChartQuery(category);
  }, [category]);

  return React.createElement(Chart, props);
};
