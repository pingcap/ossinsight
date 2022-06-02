import { Axis, BarSeries, Dataset, EChartsx, Grid, Once } from '@djagger/echartsx';
import { useLocation } from '@docusaurus/router';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React from 'react';
import NumberCounter from 'react-smooth-number-counter';
import { useTotalEvents } from '../RemoteCharts/hook';
import { useData } from './hooks';


use(CanvasRenderer);

const Chart = () => {
  const data = useData()

  return (
    <EChartsx init={{ width: 100, height: 32, renderer: 'canvas' }}>
      <Once>
        <Grid containLabel={true} top={0} bottom={8} left={0} right={0} />
        <Axis.Category.X axisLine={{ show: false }} axisTick={{ show: false }} axisLabel={{ show: false }}
                     splitLine={{ show: false }} />
        <Axis.Value.Y axisLine={{ show: false }} axisTick={{ show: false }} axisLabel={{ show: true, align: 'right', fontSize: 4, showMinLabel: true, hideOverlap: true}}
                      splitLine={{ show: false }} position={'right'} interval={100} />
        <BarSeries datasetId='original' silent color="#FFE895" encode={{ x: 'latest_timestamp', y: 'cnt' }} barMaxWidth={4} />
      </Once>
      <Dataset id='original' source={data} />
    </EChartsx>
  );
};

const Counts = () => {
  const total = useTotalEvents(true);

  return (
    <Stack direction="row" alignItems="center" divider={<Divider />}>
      <Stack direction="column">
        <Span>Total</Span>
        <Span>Events</Span>
      </Stack>
      <Numbers>
        <NumberCounter value={total ?? 0} transition={500} />
      </Numbers>
    </Stack>
  )
}

const Span = styled('span')({
  fontSize: '10px',
  color: '#7d7d7d',
  lineHeight: 1,
});

const Divider = styled('span')({
  width: 0.5,
  maxWidth: 0.5,
  minWidth: 0.5,
  height: 20,
  backgroundColor: '#555',
  marginLeft: 8,
  marginRight: 8,
});

const Numbers = styled(Span)({
  height: 20,
  fontSize: 20,
  color: 'white',
  lineHeight: 1,
});

export const RealtimeSummary = () => {
  const isSmall = useMediaQuery('(max-width: 600px)')
  const { pathname } = useLocation()

  if (pathname === '/') {
    return <></>
  }

  if (isSmall) {
    return <></>
  }

  return (
    <Stack direction="row" alignItems="center">
      <Counts />
      <Box width="100px" maxWidth="100px" minWidth="100px" marginLeft="8px">
        <Chart />
      </Box>
    </Stack>
  );
};
