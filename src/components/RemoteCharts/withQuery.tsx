import * as React from "react";
import {useRef, useState} from "react";
import {AsyncData, RemoteData, useRemoteData} from "./hook";
import Fab from '@mui/material/Fab';
import Alert from "@mui/material/Alert";
import ShareIcon from '@mui/icons-material/Share';// @ts-ignore
import CodeBlock from '@theme/CodeBlock';
import {BarChart, ChartWithSql, DataGrid, DataGridColumn, HeatMapChart, PieChart} from '../BasicCharts';
import {Queries} from "./queries";
import {DebugInfoModel} from "./DebugInfoModel";
import {YoyChart} from "../SpecialCharts";
import WorldMapChart from "../BasicCharts/WorldMapChart";
import ZScoreChart from "../SpecialCharts/ZScoreChart";
import DynamicStarsChart from "../SpecialCharts/DynamicStarsChart";
import Box from "@mui/material/Box";
import {EChartsContext} from "../ECharts";
import EChartsReact from "echarts-for-react";

type Indexes<Q extends keyof Queries> = {
  categoryIndex: keyof Queries[Q]['data']
  valueIndex: keyof Queries[Q]['data']
}

type HeatMapIndexes<Q extends keyof Queries> = {
  xIndex: keyof Queries[Q]['data']
  yIndex: keyof Queries[Q]['data']
  valueIndex: keyof Queries[Q]['data']
}

type QueryComponentProps<Q extends keyof Queries> = Queries[Q]["params"] & {
  // only for bar
  clear: boolean
  size?: number
  formatSql?: boolean
  seriesName?: string
}

// interface BarChartProps<Q extends keyof Queries> extends Indexes<Q> {
//   data: Queries[Q]['data'][]
//   loading: boolean
//   clear: boolean
//   size: number
//   n: number
//   deps: any[]
// }

export function renderChart (query, chart, {error, data}: AsyncData<RemoteData<any, any>>, clear = false) {
  const [showDebugModel, setShowDebugModel] = useState(false);
  const echartsRef = useRef<EChartsReact>()

  const handleShowDebugModel = () => {
    setShowDebugModel(true);
  }

  const handleCloseDebugModel = () => {
    setShowDebugModel(false);
  }

  if (error) {
    return <Alert severity='error'>Request failed ${(error as any)?.message ?? ''}</Alert>
  } else {
    if (clear) {
      return chart
    }

    return (
      <ChartWithSql sql={data?.sql}>
        <div style={{position: 'relative'}}>
          <EChartsContext.Provider value={{ echartsRef }}>
            {chart}
            <Fab size='small' sx={{position: 'absolute', right: 24, bottom: 24, zIndex: 'var(--ifm-z-index-fixed-mui)'}}
                 onClick={handleShowDebugModel} disabled={!data}>
              <ShareIcon />
            </Fab>
            <DebugInfoModel query={query} data={data} open={showDebugModel} onClose={handleCloseDebugModel} />
          </EChartsContext.Provider>
        </div>
      </ChartWithSql>
    )
  }
}

export function withBarChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q>> {
  return ({clear, size = 30, formatSql = true, children, categoryIndex = indices.categoryIndex, valueIndex = indices.valueIndex, seriesName, categoryType, ...params}: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData

    const chart = (
      <BarChart
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
    )

    return renderChart(query, chart, remoteData, clear)
  }
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
    const compareRemoteData = useRemoteData(query, {...params, repoId: compareId}, formatSql, !!compareId)
    const {data, loading} = remoteData
    const {data: compareData, loading: compareLoading} = compareRemoteData

    const chart = (
      <PieChart
        seriesName={seriesName}
        compareName={compareName}
        loading={loading || compareLoading}
        data={data?.data ?? []}
        compareData={compareId ? compareData?.data ?? [] : undefined}
        deps={Object.values(params).concat(compareId)}
        categoryIndex={categoryIndex}
        type={categoryType}
        valueIndex={valueIndex}
      />
    )

    return renderChart(query, chart, remoteData, false)
  }
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
    const compareRemoteData = useRemoteData(query, {...params, repoId: compareId}, formatSql, !!compareId)
    const {data, loading} = remoteData
    const {data: compareData, loading: compareLoading} = compareRemoteData

    const chart = (
      <HeatMapChart
        loading={loading}
        data={data?.data ?? []}
        deps={Object.values(params)}
        xAxisColumnName={xIndex}
        yAxisColumnName={yIndex}
        valueColumnName={valueIndex}
      />
    )

    if (!compareId) {
      return renderChart(query, chart, remoteData, false)
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
      )
      return renderChart(query, (
        <Box>
          {chart}
          {comparingChart}
        </Box>
      ), remoteData)
    }
  }
}

export function withDataGridQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>(query: Q, columns: DataGridColumn<Queries[Q]['data']>[]): React.FC<QueryComponentProps<Q>> {
  return ({ size, clear, formatSql = true, ...params }) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData
    const chart = <DataGrid<Queries[Q]['data']> columns={columns} loading={loading} data={data?.data} />

    return renderChart(query, chart, remoteData, false)
  }
}


export function withYoyChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q): React.FC<QueryComponentProps<Q>> {
  return ({formatSql = true, children, aspectRatio, ...params}: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData

    const chart = (
      <YoyChart
        loading={loading}
        data={data?.data ?? []}
        aspectRatio={aspectRatio}
      />
    )

    return renderChart(query, chart, remoteData, false)
  }
}


export function withZScoreChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q): React.FC<QueryComponentProps<Q>> {
  return ({formatSql = true, children, aspectRatio, ...params}: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData

    const chart = (
      <ZScoreChart
        loading={loading}
        data={data?.data ?? []}
      />
    )

    return renderChart(query, chart, remoteData, false)
  }
}

export function withWorldMapChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q>> {
  const {valueIndex, categoryIndex} = indices
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
    const compareRemoteData = useRemoteData(query, {...params, repoId: compareId}, formatSql, !!compareId)

    const {data, loading} = remoteData
    const {data: compareData, loading: compareLoading} = compareRemoteData

    const chart = (
      <WorldMapChart
        loading={loading || compareLoading}
        data={data?.data ?? []}
        compareData={compareId ? compareData?.data ?? [] : undefined}
        name={name}
        compareName={compareName}
        dimensionColumnName={categoryIndex}
        metricColumnName={valueIndex}
        seriesName={seriesName}
        effect={effect}
        size={size}
      />
    )

    return renderChart(query, chart, remoteData, false)
  }
}

export function withDynamicStarsChart<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q) {
  return ({formatSql = true, children, aspectRatio, ...params}: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData

    const chart = (
      <DynamicStarsChart
        loading={loading}
        data={data?.data ?? []}
      />
    )

    return renderChart(query, chart, remoteData, false)
  }
}