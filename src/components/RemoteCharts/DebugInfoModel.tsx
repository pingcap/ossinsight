import {Queries} from "./queries";
import {RemoteData} from "./hook";
import * as React from "react";
import {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {DateTime} from "luxon";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const FMT = 'yyyy-MM-dd HH:mm:ss'

export interface DebugInfoModelInfoProps {
  query: keyof Queries,
  data: RemoteData<any, any> | RemoteData<any, any>[],
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
          {(Array.isArray(data))
            ? <ManyData data={data} query={query}/>
            : renderOne(query, data)}
        </Box>
      </Dialog>
    </>
  )
}

const ManyData = ({query, data}: {query: keyof Queries, data: RemoteData<any, any>[]}) => {
  const [index,setIndex] = useState(0)
  return (
    <>
      <Tabs value={index} onChange={(e, n) => setIndex(n)}>
        {data.map((_, n) => <Tab label={`Request ${n + 1}`} />)}
      </Tabs>
      {data.map((data, n) => (
        renderOne(query, data, n, index !== n)
      ))}
    </>
  )
}

const renderOne = (query: keyof Queries, data: RemoteData<any, any>, key: number | undefined = undefined, hidden: boolean = false) => {
  return (
    <div hidden={hidden} key={key}>
      <Grid container alignItems='center'>
        <Pair title='Requested at' value={DateTime.fromISO(data?.requestedAt).toFormat(FMT)} />
        <Pair title='Expires at' value={DateTime.fromISO(data?.expiresAt).toFormat(FMT)} />
        <Pair title='Spent' value={`${data?.spent} seconds`} />
        <Pair title='Query' value={query} />
        <Pair title='Params' value={<pre>{JSON.stringify(data?.params, undefined, 2)}</pre>} />
      </Grid>
    </div>
  )
}

const Pair = ({title, value}: { title: string, value: any }) => {
  return (
    <>
      <Grid item xs={3}>
        <div>
          <Typography align='right' variant='body1'>
            {title}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={1} />
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
