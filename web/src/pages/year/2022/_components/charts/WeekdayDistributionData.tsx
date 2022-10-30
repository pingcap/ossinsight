import React from "react";
import Chart, { ChartProps } from "@site/src/components/Chart";
import { getDaysOfWeek } from "@site/src/utils/intl";
import { defaultColors } from "./colors";
import { useThemeMediaQuery } from "@site/src/hooks/theme";

interface WeekdayDistributionDataProps extends Pick<ChartProps, 'sx'>{
  data: import('../../_charts/env').WeekdayDistributionData;
}

const DAYS = getDaysOfWeek('en-US', 'long');

export default function WeekdayDistributionData({ data, sx }: WeekdayDistributionDataProps) {
  const large = useThemeMediaQuery(theme => theme.breakpoints.up('md'));

  return (
    <Chart<'bar'>
      type="bar"
      aspect={large ? 1316 / 766 : 658 / 766}
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
        font: {
          family: 'JetBrains Mono',
        },
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            max: 100,
            ticks: {
              color: '#E0E0E0',
              font: {
                size: 22,
              },
              callback: value => `${value}${data.unit}`,
            },
            grid: {
              color: '#BFBFBF80',
              borderDash: [4, 4],
            },
          },
          y: {
            ticks: {
              color: '#E0E0E0',
              font: {
                size: 19,
              },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: '#E0E0E0',
              font: {
                size: 22,
                family: 'JetBrains Mono',
              },
              boxWidth: 18,
              boxHeight: 18,
              padding: 10,
            },
            position: 'top',
            align: 'start',
          },
          tooltip: {
            titleColor: '#BFBFBF',
            titleFont: {
              size: 20,
              family: 'JetBrains Mono',
              weight: 'bold',
            },
            bodyFont: {
              size: 24,
              family: 'JetBrains Mono',
            },
            boxPadding: 8,
            padding: 12,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: {
              label: item => {
                return `${item.dataset.label}: ${item.dataset.data[item.dataIndex]}${data.unit}`;
              },
            },
          },
        },
      }}
    />
  );
}