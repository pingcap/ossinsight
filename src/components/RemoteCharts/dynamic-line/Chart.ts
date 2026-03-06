import { withDynamicLineChart } from '../withQuery';
import { Query } from './Form';
import React, { useMemo } from 'react';
import { Queries } from '../queries';

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>;
}

export const Chart = ({ query, aspectRatio, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withDynamicLineChart(query);
  }, [query, aspectRatio]);

  return React.createElement(Chart, props);
};
