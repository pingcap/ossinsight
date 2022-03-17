import {withBarChartQuery, withDataGridQuery, withWorldMapChartQuery} from "../withQuery";
import {Query} from "./Form";
import React, {useMemo} from "react";
import {Queries} from "../queries";

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>
}

export const Chart = ({ category, categoryIndex = 'country', valueIndex, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withWorldMapChartQuery(category, {
      categoryIndex: categoryIndex,
      valueIndex: valueIndex
    })
  }, [category, categoryIndex, valueIndex])

  return React.createElement(Chart, props)
}
