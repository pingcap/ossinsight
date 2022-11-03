import React from 'react';
import Chart, { ChartProps } from '@site/src/components/Chart';
import { getDaysOfWeek } from '@site/src/utils/intl';
import { defaultColors } from './colors';
import useIsLarge from '../hooks/useIsLarge';
import theme from './theme';

interface WeekdayDistributionDataProps extends Pick<ChartProps, 'sx'> {
  data: import('../../_charts/env').WeekdayDistributionData;
}

const DAYS = getDaysOfWeek('en-US', 'long');

export default function WeekdayDistributionData ({ data, sx }: WeekdayDistributionDataProps) {
  const large = useIsLarge();

  return (
    <Chart<'bar'>
      type="bar"
      aspect={large ? 16 / 9 : 3 / 4}
      sx={sx}
      data={{
        labels: data.data.map(item => item[0]),
        datasets: DAYS.map((day, i) => ({
          data: data.data.map(item => item[i + 1]) as number[],
          label: DAYS[i],
          stack: 'a',
          backgroundColor: defaultColors[i % defaultColors.length],
        })),
      }}
      options={{
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            max: 100,
            ticks: {
              color: theme.color.ticks,
              font: theme.font.ticks,
              callback: value => `${value}${data.unit}`,
            },
            grid: theme.grid.normal,
          },
          y: {
            ticks: {
              color: theme.color.ticks,
              font: theme.font.ticks,
            },
            grid: theme.grid.hidden,
          },
        },
        plugins: {
          legend: {
            labels: {
              color: theme.color.legend,
              font: theme.font.legend,
              boxWidth: 18,
              boxHeight: 18,
              padding: 10,
            },
            position: 'top',
            align: 'start',
          },
          tooltip: {
            titleColor: theme.color.tooltipTitle,
            titleFont: theme.font.tooltipTitle,
            bodyFont: theme.font.tooltipBody,
            boxPadding: 8,
            padding: 12,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: {
              label: item => {
                return `${item.dataset.label as string}: ${item.dataset.data[item.dataIndex]}${data.unit}`;
              },
            },
          },
        },
      }}
    />
  );
}
