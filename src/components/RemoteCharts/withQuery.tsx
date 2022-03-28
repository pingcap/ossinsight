import * as React from "react";
import {useState} from "react";
import {AsyncData, RemoteData, useRemoteData} from "./hook";
import Fab from '@mui/material/Fab';
import Alert from "@mui/material/Alert";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// @ts-ignore
import CodeBlock from '@theme/CodeBlock';
import {BarChart, ChartWithSql, DataGrid, DataGridColumn} from '../BasicCharts';
import {Queries} from "./queries";
import {DebugInfoModel} from "./DebugInfoModel";
import {YoyChart} from "../SpecialCharts";
import WorldMapChart from "../BasicCharts/WorldMapChart";
import ZScoreChart from "../SpecialCharts/ZScoreChart";
import DynamicStarsChart from "../SpecialCharts/DynamicStarsChart";

type Indexes<Q extends keyof Queries> = {
  categoryIndex: keyof Queries[Q]['data']
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

function renderChart (query, chart, {error, data}: AsyncData<RemoteData<any, any>>, clear) {
  const [showDebugModel, setShowDebugModel] = useState(false);

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
          {chart}
          <Fab size='small' sx={{position: 'absolute', zIndex: 10, right: 24, bottom: 24}}
               onClick={handleShowDebugModel} disabled={!data}>
            <HelpOutlineIcon />
          </Fab>
          <DebugInfoModel query={query} data={data} open={showDebugModel} onClose={handleCloseDebugModel} />
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
  const { valueIndex, categoryIndex } = indices
  return ({formatSql = true, children, seriesName, ...params}: QueryComponentProps<Q>) => {
    const remoteData = useRemoteData(query, params, formatSql);
    const { data, loading } = remoteData

    const chart = (
      <WorldMapChart
        loading={loading}
        data={data?.data ?? []}
        dimensionColumnName={categoryIndex}
        metricColumnName={valueIndex}
        seriesName={seriesName}
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