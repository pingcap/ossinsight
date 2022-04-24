import {Queries} from "./queries";
import {RemoteData} from "./hook";
import * as React from "react";
import {useContext, useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {DateTime} from "luxon";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {EChartsContext} from "../ECharts";
import AspectRatio from "react-aspect-ratio";
import Image from "../Image";
import Stack from "@mui/material/Stack";
import {FacebookIcon, LinkedinIcon, RedditIcon, TelegramIcon, TwitterIcon} from "react-share";

export interface DebugInfoModelInfoProps {
  query: keyof Queries,
  data: RemoteData<any, any> | RemoteData<any, any>[],
  open: boolean,
  onClose: () => any
}

export const DebugInfoModel = ({ query, data, open, onClose }: DebugInfoModelInfoProps) => {
  const { echartsRef } = useContext(EChartsContext)
  const [imgData, setImgData] = useState<string>()

  useEffect(() => {
    if (!data) {
      onClose();
    }
  }, [data])

  useEffect(() => {
    if (open) {
      const canvas = echartsRef?.current?.ele?.getElementsByTagName('canvas')?.[0]
      if (canvas) {
        setImgData(canvas.toDataURL('image/jpeg'))
      }
    }
  }, [open])

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
          [WIP] Share chart
        </DialogTitle>
        <Stack sx={{p: 4}} direction={['column', 'column', 'row']}>
          <Box sx={{ borderRadius: 1, overflow: 'hidden', flex: 1 }}>
            <AspectRatio ratio={16 / 9}>
              <Image src={imgData} style={{ backgroundPosition: 'top left' }} />
            </AspectRatio>
          </Box>
          <Box sx={{ flex: 1, p: 4 }}>
            <Stack direction='row' gap={2}>
              <TwitterIcon round size={32} />
              <FacebookIcon round size={32} />
              <LinkedinIcon round size={32} />
              <RedditIcon round size={32} />
              <TelegramIcon round size={32} />
            </Stack>
          </Box>
        </Stack>
      </Dialog>
    </>
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
