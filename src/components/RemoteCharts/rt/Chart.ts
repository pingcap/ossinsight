import {withBarChartQuery, withDataGridQuery} from "../withQuery";
import {Query} from "./Form";
import React, {useMemo} from "react";
import {Queries} from "../queries";

interface ChartProps<Q extends keyof Queries = any> extends Record<string, any> {
  query: Query<Q>
}

export const Chart = ({ category, categoryIndex = 'repo_name', valueIndex, ...props }: ChartProps) => {
  const Chart = useMemo(() => {
    return withDataGridQuery(category, [{
      field: categoryIndex,
      title: categoryIndex
    }, {
      field: valueIndex,
      title: valueIndex
    }])
  }, [category, categoryIndex, valueIndex])

  return React.createElement(Chart, props)
}
