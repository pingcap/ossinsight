import * as React from "react";
import {RemoteData, useRemoteData} from "./hook";
import Fab from '@mui/material/Fab';
import Alert from "@mui/material/Alert";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// @ts-ignore
import CodeBlock from '@theme/CodeBlock';
import BarChart from './BarChart';
import {Queries} from "./queries";
import {useState} from "react";
import {DebugInfoModel, renderCodes} from "./DebugInfoModel";
import DataGrid, {Column} from "./DataGrid";

type Indexes<Q extends keyof Queries> = {
  categoryIndex: keyof Queries[Q]['data']
  valueIndex: keyof Queries[Q]['data']
}

type QueryComponentProps<Q extends keyof Queries> = Queries[Q]["params"] & {
  // only for bar
  clear: boolean
  size?: number
  formatSql?: boolean}

// interface BarChartProps<Q extends keyof Queries> extends Indexes<Q> {
//   data: Queries[Q]['data'][]
//   loading: boolean
//   clear: boolean
//   size: number
//   n: number
//   deps: any[]
// }

export function withBarChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q>> {
  return ({clear, size = 30, formatSql = true, children, categoryIndex = indices.categoryIndex, valueIndex = indices.valueIndex, ...params}: QueryComponentProps<Q>) => {
    const {data, loading, error} = useRemoteData(query, params, formatSql);
    const [showDebugModel, setShowDebugModel] = useState(false);

    const handleShowDebugModel = () => {
      setShowDebugModel(true);
    }

    const handleCloseDebugModel = () => {
      setShowDebugModel(false);
    }

    const chart = React.createElement(BarChart, {
      categoryIndex,
      valueIndex,
      size,
      data: data?.data ?? [],
      loading,
      clear,
      n: params.n,
      deps: Object.values(params)
    })
    if (error) {
      return <Alert severity='error'>Request failed ${(error as any)?.message ?? ''}</Alert>
    } else {
      if (clear) {
        return chart
      }

      return (
        <>
          <div style={{ position: 'relative' }}>
            {chart}
            <Fab size='small' sx={{ position: 'absolute', zIndex: 10, right: 24, bottom: 24 }} onClick={handleShowDebugModel} disabled={!data}>
              <HelpOutlineIcon />
            </Fab>
            <DebugInfoModel query={query} data={data} open={showDebugModel} onClose={handleCloseDebugModel} />
          </div>
          {renderCodes(data?.sql)}
        </>
      )
    }
  }
}

export function withDataGridQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>(query: Q, columns: Column<Q>[]): React.FC<QueryComponentProps<Q>> {
  return ({ size, clear, formatSql = true, ...params }) => {
    const {data, loading, error} = useRemoteData(query, params, formatSql)
    const [showDebugModel, setShowDebugModel] = useState(false);

    const handleShowDebugModel = () => {
      setShowDebugModel(true);
    }

    const handleCloseDebugModel = () => {
      setShowDebugModel(false);
    }

    const chart = <DataGrid<Q> columns={columns} loading={loading} data={data?.data} />

    if (error) {
      return <Alert severity='error'>Request failed ${(error as any)?.message ?? ''}</Alert>
    }
    return (
      <>
        <div style={{ position: 'relative' }}>
          {chart}
          <Fab size='small' sx={{ position: 'absolute', zIndex: 10, right: 24, bottom: 24 }} onClick={handleShowDebugModel} disabled={!data}>
            <HelpOutlineIcon />
          </Fab>
          <DebugInfoModel query={query} data={data} open={showDebugModel} onClose={handleCloseDebugModel} />
        </div>
        {renderCodes(data?.sql)}
      </>
    )
  }
}
