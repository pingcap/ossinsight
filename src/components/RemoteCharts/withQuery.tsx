import * as React from "react";
import {RemoteData, useRemoteData} from "./hook";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid';
import Skeleton from "@mui/material/Skeleton";
import Fab from '@mui/material/Fab';
import Alert from "@mui/material/Alert";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Typography from '@mui/material/Typography';
// @ts-ignore
import CodeBlock from '@theme/CodeBlock';
import BarChart from './BarChart';
import {Queries} from "./queries";
import {useEffect} from "react";
import {DateTime} from 'luxon'


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
            <DebugInfo data={data} query={query} />
          </div>
          {renderCodes(data?.sql)}
        </>
      )
    }
  }
}

const FMT = 'yyyy-MM-dd HH:mm:ss'

const DebugInfo = ({ query, data }: { query: keyof Queries, data: RemoteData<any, any>}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!data) {
      handleClose()
    }
  }, [data])


  return (
    <>
      <Fab size='small' sx={{ position: 'absolute', zIndex: 10, right: 24, bottom: 24 }} onClick={handleOpen} disabled={!data}>
        <HelpOutlineIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle>
          [For Debug] SQL Execution info
        </DialogTitle>
        <Box sx={{p: 4}}>
          {renderCodes(data?.sql)}
          <Grid container alignItems='center'>
            <Pair title='Requested at' value={DateTime.fromISO(data?.requestedAt).toFormat(FMT)} />
            <Pair title='Expires at' value={DateTime.fromISO(data?.expiresAt).toFormat(FMT)} />
            <Pair title='Spent' value={`${data?.spent} seconds`} />
            <Pair title='Query' value={query} />
            <Pair title='Params' value={<pre>{JSON.stringify(data?.params, undefined, 2)}</pre>} />
          </Grid>
        </Box>
      </Dialog>
    </>
  )
}

const Pair = ({ title, value }: { title: string, value: any }) => {
  return (
    <>
      <Grid xs={3}>
        <div>
          <Typography align='right' variant='body1'>
            {title}
          </Typography>
        </div>
      </Grid>
      <Grid xs={1}/>
      <Grid xs={8}>
        <div>
          <Typography align='left' variant='body2'>
            {value}
          </Typography>
        </div>
      </Grid>
    </>
  )
}

const renderCodes = sql => {
  let content = undefined
  if (!sql) {
    content = (
      <Box sx={{pt: 0.5}}>
        <Skeleton width="80%" />
        <Skeleton width="50%" />
        <Skeleton width="70%" />
      </Box>
    )
  } else {
    content = (
      <CodeBlock className='language-sql'>
        {sql}
      </CodeBlock>
    )
  }
  return content
}
