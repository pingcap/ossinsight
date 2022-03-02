import {Queries} from "./queries";
import {RemoteData} from "./hook";
import * as React from "react";
import {useEffect} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {DateTime} from "luxon";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import CodeBlock from "@theme/CodeBlock";

const FMT = 'yyyy-MM-dd HH:mm:ss'

export interface DebugInfoModelInfoProps {
  query: keyof Queries,
  data: RemoteData<any, any>,
  open: boolean,
  onClose: () => any
}

export const DebugInfoModel = ({ query, data, open, onClose }: DebugInfoModelInfoProps) => {
  useEffect(() => {
    if (!data) {
      onClose();
    }
  }, [data])

  return (
    <>
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth={true}
        onClose={onClose}
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
      <Grid item xs={3}>
        <div>
          <Typography align='right' variant='body1'>
            {title}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={1}/>
      <Grid item xs={8}>
        <div>
          <Typography align='left' variant='body2' component="div">
            {value}
          </Typography>
        </div>
      </Grid>
    </>
  )
}

export const renderCodes = sql => {
  let content = undefined;
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
