import { EChartsx } from '@site/src/components/ECharts';
import { Axis, BarSeries, Dataset, Grid, Once } from '@djagger/echartsx';
import { useLocation } from '@docusaurus/router';
import React from 'react';
import AnimatedNumber from 'react-awesome-animated-number';
import useVisibility from '../../hooks/visibility';
import { useTotalEvents } from '../RemoteCharts/hook';
import { useRealtimeEvents } from './hooks';

import { Box, Stack, styled, Tooltip, useMediaQuery } from '@mui/material';

const Chart = ({ visible }: { visible: boolean }) => {
  const data = useRealtimeEvents(visible);

  return (
    <Box width="100px" maxWidth="100px" minWidth="100px" marginLeft="8px">
      <EChartsx init={{ width: 100, height: 32, renderer: 'canvas' }}>
        <Once>
          <Grid containLabel={true} top={0} bottom={8} left={0} right={0} />
          <Axis.Category.X axisLine={{ show: false }} axisTick={{ show: false }} axisLabel={{ show: false }}
                       splitLine={{ show: false }} />
          <Axis.Value.Y axisLine={{ show: false }} axisTick={{ show: false }} axisLabel={{ show: true, align: 'right', fontSize: 4, showMinLabel: true, hideOverlap: true }}
                        splitLine={{ show: false }} position={'right'} interval={100} />
          <BarSeries datasetId='original' silent color="#FFE895" encode={{ x: 'latest_timestamp', y: 'cnt' }} barMaxWidth={4} />
        </Once>
        <Dataset id='original' source={data} />
      </EChartsx>
    </Box>
  );
};

const Counts = ({ visible }: { visible: boolean }) => {
  const total = useTotalEvents(visible, 5000);

  return (
    <Stack direction="row" alignItems="center" divider={<Divider />}>
      <Stack direction="column">
        <Span>Total</Span>
        <Span>Events</Span>
      </Stack>
      <Numbers>
        <AnimatedNumber value={total ?? 0} hasComma duration={200} size={18} />
      </Numbers>
    </Stack>
  );
};

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
  fontSize: 18,
  color: 'white',
  lineHeight: 1.1,
});

const TooltipTitle = () => (
  <div>
    ⌛️ GitHub events data importing in <b>Realtime</b>.
    <br/>
    📊 Each bar = Data importing in per 5 seconds.
  </div>
);

export const RealtimeSummary = () => {
  const visible = useVisibility();
  const isSmall = useMediaQuery('(max-width: 600px)');
  const { pathname } = useLocation();

  if (pathname === '/') {
    return <></>;
  }

  if (isSmall) {
    return <></>;
  }

  return (
    <Tooltip
      title={<TooltipTitle />}
      arrow
    >
      <Stack direction="row" alignItems="center">
        <Counts visible={visible} />
        <Chart visible={visible} />
      </Stack>
    </Tooltip>
  );
};
