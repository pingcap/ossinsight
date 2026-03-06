import { withHeatMapChartQuery } from '../withQuery';
import { Query } from './Form';
import React, { useMemo } from 'react';
import { Queries } from '../queries';

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>;
}

export const Chart = ({ category, xIndex, yIndex, valueIndex, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withHeatMapChartQuery(category, {
      xIndex,
      yIndex,
      valueIndex,
    });
  }, [category, xIndex, yIndex, valueIndex, valueIndex]);

  return React.createElement(Chart, props);
};
