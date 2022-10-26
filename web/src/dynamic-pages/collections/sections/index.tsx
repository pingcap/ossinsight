import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { PropsWithChildren, useLayoutEffect, useRef } from 'react';
import AspectRatio from 'react-aspect-ratio';
import type { Collection } from '@ossinsight/api';
import { H1, P1 } from './typograpy';

export default function Sections ({ collection, description, children }: PropsWithChildren<{ description: string, collection: Collection}>) {
  return (
    <>
      <P1>{description}</P1>
      {/* <P1>Enjoy there insights on many metrics in many styles... 👇</P1> */}
      {/* <Grid container justifyContent='space-between' mb={6}>
        <Link source={require('./videos/month-rank.mp4').default} title={['Monthly', 'Rankings']} target={`/collections/${collection?.slug}`} color='transparent linear-gradient(180deg, #DF5CFF 0%, #18191A 100%) 0% 0% no-repeat padding-box'/>
        <Link source={require('./videos/history-sort.mp4').default} title={['Bar Chart', 'Race']} target={`/collections/${collection?.slug}/trends#bar-chart-race`} color='transparent linear-gradient(180deg, #628DFF 0%, #18191A 100%) 0% 0% no-repeat padding-box'/>
        <Link source={require('./videos/history-rank.mp4').default} title={['Historical', 'Rankings']} target={`/collections/${collection?.slug}/trends#historical-rankings`} color='transparent linear-gradient(180deg, #FF628E 0%, #18191A 100%) 0% 0% no-repeat padding-box'/>
      </Grid> */}
      {children}
    </>
  )
}

const Link = ({ title, source, target, color }: { title: string[], source: string, target: string, color: string }) => {
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
    <Grid item xs={12} md={4} mt={2} mr={2} component='a' pl={2} pr={1} href={target} height={102} maxWidth='243px !important' display='flex' sx={{background: color}} borderRadius='6px' justifyContent='space-between' alignItems='center'>
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
