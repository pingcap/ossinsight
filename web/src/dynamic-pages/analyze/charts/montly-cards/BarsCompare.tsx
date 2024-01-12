import React from 'react';
import { EChartsx } from '@site/src/components/ECharts';
import { BarSeries, Dataset, Once, Tooltip } from '@djagger/echartsx';
import { useAnalyzeChartContext } from '../context';
import { useDiff, usePartData, useReversed } from './hooks';
import { Diff, Title } from './ui';
import { AxisBase, formatDate } from './base';

import { Box, Typography } from '@mui/material';

interface BarsProps {
  color: string;
  title: string;
  icon: React.ReactNode;
  dayKey?: string;
  dayValueKey: string;
  totalKey: string;
}

export default function BarsCompare ({ color, icon, title, dayValueKey, dayKey = 'period_day', totalKey }: BarsProps) {
  const { data } = useAnalyzeChartContext<any>();
  const diff = useDiff(data.data?.data ?? [], totalKey, dayKey);
  const reversed = useReversed(data.data?.data ?? []);
  const currentData = usePartData(reversed, 'current', dayValueKey, dayKey);
  const lastData = usePartData(reversed, 'last', dayValueKey, dayKey);

  return (
    <Box>
      <Box display="flex" flexDirection="column" justifyContent="center">
        <Title icon={icon} title={title} />
        <Typography color={color} fontWeight="bold" fontSize={16}>
          {data.data?.data[0]['current_' + totalKey]}
          <Diff value={diff} />
        </Typography>
      </Box>
      <EChartsx style={{ flex: 1 }} init={{ height: 96, renderer: 'canvas' }} theme="dark">
        <Once>
          <AxisBase />
          <Tooltip trigger="axis" axisPointer={{}} formatter={formatter(title)} />
          <BarSeries encode={{ x: 'idx', y: 'value' }} color={color} datasetId="current" barMaxWidth={4} />
          <BarSeries encode={{ x: 'idx', y: 'value' }} color="#7C7C7C" datasetId="last" barMaxWidth={4} />
        </Once>
        <Dataset id="current" source={currentData} />
        <Dataset id="last" source={lastData} />
      </EChartsx>
    </Box>
  );
}

const formatter = (title: string) => (seriesList: any[]): string => {
  return seriesList.map(series => `${series.marker as string} ${formatDate(series.data.day)}: <b>${series.data.value as number}</b> ${title}`).join('<br>');
};
