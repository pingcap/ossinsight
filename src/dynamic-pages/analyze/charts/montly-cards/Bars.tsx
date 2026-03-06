import React from 'react';
import { EChartsx } from '@/components/ECharts';
import { BarSeries, Dataset, Once, Tooltip } from '@/lib/echartsx';
import { useAnalyzeChartContext } from '../context';
import { useReversed } from './hooks';
import { AxisBase, formatDate } from './base';
import { Title } from './ui';

import { Stack, Box, Typography } from '@mui/material';

interface BarsProps {
  color: string;
  title: string;
  icon: React.ReactNode;
  dayKey?: string;
  dayValueKey: string;
  totalKey: string;
}

export default function Bars ({ color, icon, title, dayValueKey, dayKey = 'current_period_day', totalKey }: BarsProps) {
  const { data } = useAnalyzeChartContext<any>();

  return (
    <Stack direction="row">
      <Box minWidth={96} display="flex" flexDirection="column" justifyContent="center">
        <Title icon={icon} title={title} />
        <Typography color={color} fontWeight="bold" fontSize={24}>{data.data?.data[0][totalKey]}</Typography>
      </Box>
      <Box flex={1} position="relative" height="74px">
        <EChartsx style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}
                  init={{ renderer: 'canvas' }} theme="dark">
          <Once>
            <AxisBase />
            <Tooltip trigger="axis" axisPointer={{}}
                     formatter={(params) => {
                       const first = Array.isArray(params) ? params[0] : params;
                       const data = (first as { value?: Record<string, unknown>; marker?: string })?.value ?? {};
                       const marker = (first as { marker?: string })?.marker ?? '';
                       return `${marker} ${formatDate(data[dayKey] as string)}: <b>${data[dayValueKey] as number}</b> ${title}`;
                     }} />
            <BarSeries encode={{ x: 'idx', y: dayValueKey }} color={color} barMaxWidth={8} />
          </Once>
          <Dataset source={useReversed(data.data?.data ?? [])} />
        </EChartsx>
      </Box>
    </Stack>
  );
}
