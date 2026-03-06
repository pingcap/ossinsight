import { withDynamicStarsChart } from '../withQuery';
import { Query } from './Form';
import React, { useMemo } from 'react';
import { Queries } from '../queries';

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>;
}

export const Chart = ({ category, aspectRatio, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withDynamicStarsChart(category);
  }, [category, aspectRatio]);

  return React.createElement(Chart, props);
};
