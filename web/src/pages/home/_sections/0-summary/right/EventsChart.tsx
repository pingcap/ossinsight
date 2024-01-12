import { EChartsx } from '@site/src/components/ECharts';
import { Axis, BarSeries, Dataset, Grid, Once } from '@djagger/echartsx';
import React, { useLayoutEffect, useRef } from 'react';
import { useRealtimeEvents } from '@site/src/components/RealtimeSummary/hooks';
import type { EChartsType } from 'echarts/core';

import { Box, useTheme, useMediaQuery } from '@mui/material';

export const EventsChart = ({ show }: { show: boolean }) => {
  const data = useRealtimeEvents(show);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const echartsRef = useRef<EChartsType>(null);

  useLayoutEffect(() => {
    echartsRef.current?.resize({ width: 'auto' });
  }, [isSmall]);

  return (
    <Box width={isSmall ? '100%' : '61.8%'}>
      <EChartsx init={{ height: isSmall ? 160 : 120, renderer: 'canvas' }} ref={echartsRef}>
        <Once>
          <Grid containLabel={true} top={0} bottom={8} left={0} right={0} />
          <Axis.Category.X axisLine={{ show: false }} axisTick={{ show: false }} axisLabel={{ show: false }}
                           splitLine={{ show: false }} />
          <Axis.Value.Y axisLine={{ show: false }} axisTick={{ show: false }} axisLabel={{ show: true, align: 'right', fontSize: 12, showMinLabel: true, showMaxLabel: false, hideOverlap: true }}
                        splitLine={{ show: false }} position={'left'} interval={100} />
          <BarSeries datasetId='original' silent color="#F77C00" encode={{ x: 'latest_timestamp', y: 'cnt' }} barMaxWidth={12} />
        </Once>
        <Dataset id='original' source={data} />
      </EChartsx>
    </Box>
  );
};

export default EventsChart;
