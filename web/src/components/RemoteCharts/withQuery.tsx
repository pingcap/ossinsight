import * as React from 'react';
import { useRef } from 'react';
import { AsyncData, RemoteData, useRemoteData } from './hook';
import { BarChart, ChartWithSql, HeatMapChart, PieChart } from '../BasicCharts';
import { Queries } from './queries';
import { YoyChart } from '../SpecialCharts';
import WorldMapChart from '../BasicCharts/WorldMapChart';
import ZScoreChart from '../SpecialCharts/ZScoreChart';
import DynamicStarsChart from '../SpecialCharts/DynamicStarsChart';
import DynamicLineChart from '../SpecialCharts/DynamicLineChart';
import { EChartsContext } from '../ECharts';
import type EChartsReact from 'echarts-for-react';
import { useDebugDialog } from '../DebugDialog';
import { isNullish, notNullish } from '@site/src/utils/value';
import { getErrorMessage } from '@site/src/utils/error';

import { Alert, Box } from '@mui/material';

type Indexes<Q extends keyof Queries> = {
  categoryIndex: keyof Queries[Q]['data'];
  valueIndex: keyof Queries[Q]['data'];
};

type HeatMapIndexes<Q extends keyof Queries> = {
  xIndex: keyof Queries[Q]['data'];
  yIndex: keyof Queries[Q]['data'];
  valueIndex: keyof Queries[Q]['data'];
};

type QueryComponentProps<Q extends keyof Queries> = Queries[Q]['params'] & {
  // only for bar
  clear: boolean;
  size?: number;
  formatSql?: boolean;
  seriesName?: string;
};

// interface BarChartProps<Q extends keyof Queries> extends Indexes<Q> {
//   data: Queries[Q]['data'][]
//   loading: boolean
//   clear: boolean
//   size: number
//   n: number
//   deps: any[]
// }

export function renderChart (query, chart, { error, data }: AsyncData<RemoteData<any, any>>, clear = false) {
  const { dialog: debugDialog, button: debugButton } = useDebugDialog(data);
  const echartsRef = useRef<EChartsReact>(null);

  if (notNullish(error)) {
    return <Alert severity="error">Request failed ${getErrorMessage(error)}</Alert>;
  } else {
    if (clear) {
      return chart;
    }

    return (
      <ChartWithSql sql={data?.sql}>
        <div style={{ position: 'relative' }}>
          <Box display="flex" justifyContent="flex-end">
            {debugButton}
          </Box>
          <EChartsContext.Provider value={{ echartsRef }}>
            {chart}
            {debugDialog}
          </EChartsContext.Provider>
        </div>
      </ChartWithSql>
    );
  }
}

export function withBarChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q>> {
  return ({ clear, size = 30, formatSql = true, children, categoryIndex = indices.categoryIndex, valueIndex = indices.valueIndex, seriesName, categoryType, ...params }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData;

    const chart = (
      <BarChart<D>
        seriesName={seriesName}
        loading={loading}
        clear={clear}
        data={data?.data ?? []}
        size={size}
        n={data?.data?.length ?? params.n}
        deps={Object.values(params)}
        categoryIndex={categoryIndex}
        type={categoryType}
        valueIndex={valueIndex}
      />
    );

    return renderChart(query, chart, remoteData, clear);
  };
}

export function withPieChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q>> {
  return ({
    formatSql = true,
    children,
    categoryIndex = indices.categoryIndex,
    valueIndex = indices.valueIndex,
    seriesName,
    categoryType,
    compareId,
    compareName,
    ...params
  }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const compareRemoteData = useRemoteData(query, { ...params, repoId: compareId }, formatSql, notNullish(compareId));
    const { data, loading } = remoteData;
    const { data: compareData, loading: compareLoading } = compareRemoteData;

    const chart = (
      <PieChart<D>
        seriesName={seriesName}
        compareName={compareName}
        loading={loading || compareLoading}
        data={data?.data ?? []}
        compareData={notNullish(compareId) ? compareData?.data ?? [] : undefined}
        deps={Object.values(params).concat(compareId)}
        categoryIndex={categoryIndex}
        type={categoryType}
        valueIndex={valueIndex}
      />
    );

    return renderChart(query, chart, remoteData, false);
  };
}

export function withHeatMapChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: HeatMapIndexes<Q>): React.FC<QueryComponentProps<Q>> {
  return ({
    formatSql = true,
    children,
    xIndex = indices.xIndex,
    yIndex = indices.yIndex,
    valueIndex = indices.valueIndex,
    seriesName,
    compareName,
    compareId,
    ...params
  }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const compareRemoteData = useRemoteData(query, { ...params, repoId: compareId }, formatSql, notNullish(compareId));
    const { data, loading } = remoteData;
    const { data: compareData, loading: compareLoading } = compareRemoteData;

    const chart = (
      <HeatMapChart<D>
        loading={loading}
        data={data?.data ?? []}
        deps={Object.values(params)}
        xAxisColumnName={xIndex}
        yAxisColumnName={yIndex}
        valueColumnName={valueIndex}
      />
    );

    if (isNullish(compareId)) {
      return renderChart(query, chart, remoteData, false);
    } else {
      const comparingChart = (
        <HeatMapChart
          loading={compareLoading}
          data={compareData?.data ?? []}
          deps={Object.values(params)}
          xAxisColumnName={xIndex}
          yAxisColumnName={yIndex}
          valueColumnName={valueIndex}
        />
      );
      return renderChart(query, (
        <Box>
          {chart}
          {comparingChart}
        </Box>
      ), remoteData);
    }
  };
}

export function withYoyChartQuery<Q extends keyof Queries,
  // D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>,
  >
(query: Q): React.FC<QueryComponentProps<Q>> {
  return ({ formatSql = true, children, aspectRatio, ...params }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData;

    const chart = (
      <YoyChart
        loading={loading}
        data={data?.data ?? []}
        aspectRatio={aspectRatio}
      />
    );

    return renderChart(query, chart, remoteData, false);
  };
}

export function withZScoreChartQuery<Q extends keyof Queries,
  // D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>
  >
(query: Q): React.FC<QueryComponentProps<Q>> {
  return ({ formatSql = true, children, aspectRatio, ...params }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData;

    const chart = (
      <ZScoreChart
        loading={loading}
        data={data?.data ?? []}
      />
    );

    return renderChart(query, chart, remoteData, false);
  };
}

export function withWorldMapChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q>> {
  const { valueIndex, categoryIndex } = indices;
  return ({
    formatSql = true,
    children,
    seriesName,
    effect,
    size,
    compareId,
    name,
    compareName,
    ...params
  }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const compareRemoteData = useRemoteData(query, { ...params, repoId: compareId }, formatSql, notNullish(compareId));

    const { data, loading } = remoteData;
    const { data: compareData, loading: compareLoading } = compareRemoteData;

    const chart = (
      <WorldMapChart<D>
        loading={loading || compareLoading}
        data={data?.data ?? []}
        compareData={notNullish(compareId) ? compareData?.data ?? [] : undefined}
        name={name}
        compareName={compareName}
        dimensionColumnName={categoryIndex}
        metricColumnName={valueIndex}
        seriesName={seriesName}
        effect={effect}
        size={size}
      />
    );

    return renderChart(query, chart, remoteData, false);
  };
}

export function withDynamicStarsChart<Q extends keyof Queries,
  // D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>
  >
(query: Q) {
  return ({ formatSql = true, children, aspectRatio, ...params }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData;

    const chart = (
      <DynamicStarsChart
        loading={loading}
        data={data?.data ?? []}
      />
    );

    return renderChart(query, chart, remoteData, false);
  };
}

export function withDynamicLineChart<Q extends keyof Queries,
  // D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>
  >
(query: Q) {
  return ({ formatSql = true, aspectRatio, seriesIndex, xIndex, yIndex, ...params }: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData;

    const chart = (
      <DynamicLineChart
        loading={loading}
        data={data?.data ?? []}
        aspectRatio={aspectRatio}
        seriesIndex={seriesIndex}
        xIndex={xIndex}
        yIndex={yIndex}
      />
    );

    return renderChart(query, chart, remoteData, false);
  };
}
