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


type Indexes<Q extends keyof Queries> = {
  categoryIndex: keyof Queries[Q]['data']
  valueIndex: keyof Queries[Q]['data']
}

type QueryComponentProps<Q extends keyof Queries, C> = Queries[Q]["params"] & {
  clear: boolean
  size?: number
  children: C
}

interface BarChartProps<Q extends keyof Queries> extends Indexes<Q> {
  data: Queries[Q]['data'][]
  loading: boolean
  clear: boolean
  size: number
  n: number
  deps: any[]
}

export function withBarChartQuery<Q extends keyof Queries, D = RemoteData<Queries[Q]['params'], Queries[Q]['data']>>
(query: Q, indices: Indexes<Q>): React.FC<QueryComponentProps<Q, BarChartProps<Q>>> {

  const {categoryIndex, valueIndex} = indices

  return ({clear, size = 30, children, ...params}: QueryComponentProps<Q, BarChartProps<Q>>) => {
    const {data, loading, error} = useRemoteData(query, params)
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

