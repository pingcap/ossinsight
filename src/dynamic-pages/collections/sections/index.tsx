import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { useLayoutEffect, useRef } from 'react';
import AspectRatio from 'react-aspect-ratio';
import { Collection, useCollection } from '../hooks/useCollection';
import HistorySection from './history';
import HistoryRankSection from './history-rank';
import HistorySortSection from './history-sort';
import MonthRankSection from './month-rank';
import { H1, P1 } from './typograpy';

export default function Sections ({ collection }: { collection: Collection}) {
  return (
    <>
      <H1>{collection?.name ?? 'Loading'}</H1>
      <P1>This page analyzes a collection of popular repos in `<b>{collection?.name ?? 'Loading'}</b>` fields.</P1>
      <P1>Enjoy there insights on many metrics in many styles... 👇</P1>
      <Grid container justifyContent='space-between'>
        <Link source={require('./videos/month-rank.mp4').default} title={['Monthly', 'Rankings']} hash='monthly-rankings' color='transparent linear-gradient(180deg, #DF5CFF 0%, #18191A 100%) 0% 0% no-repeat padding-box'/>
        <Link source={require('./videos/history-sort.mp4').default} title={['Bar Chart', 'Race']} hash='bar-chart-race' color='transparent linear-gradient(180deg, #628DFF 0%, #18191A 100%) 0% 0% no-repeat padding-box'/>
        <Link source={require('./videos/history-rank.mp4').default} title={['Historical', 'Rankings']} hash='historical-rankings' color='transparent linear-gradient(180deg, #FF628E 0%, #18191A 100%) 0% 0% no-repeat padding-box'/>
      </Grid>
      <MonthRankSection />
      {/* <HistorySortSection /> */}
      <HistoryRankSection />
      <HistorySection />
    </>
  )
}

const Link = ({ title, source, hash, color }: { title: string[], source: string, hash: string, color: string }) => {
  const ref = useRef<HTMLVideoElement>()
  useLayoutEffect(() => {
    const video = ref.current
    if (video) {
      video.onload = function () {
        video.play().catch()
      }
    }
  }, [])

  return (
    <Grid item xs={12} md={4} mt={2} mr={2} component='a' pl={2} pr={1} href={'#' + hash} height={102} maxWidth='243px !important' display='flex' sx={{background: color}} borderRadius='6px' justifyContent='space-between' alignItems='center'>
      <Box flex={1} fontSize={16} fontWeight='bold' color='white'>
        <Box>
          {title.map(line => <Box key={line} display='block'>{line}</Box>)}
          <ArrowRightAltIcon />
        </Box>
      </Box>
      <div style={{ flex: 1, maxWidth: 98 }}>
        <AspectRatio ratio={856/776} style={{ width: '100%' }}>
          <video ref={ref} src={source} width="100%" height="100%" autoPlay loop muted />
        </AspectRatio>
      </div>
    </Grid>
  )
}
