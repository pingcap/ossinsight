import Chart, { ChartProps } from '@site/src/components/Chart';
import React, { useMemo } from 'react';
import { defaultColors } from './colors';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import theme from './theme';
import { responsive } from './responsive';

type RankData = {
  labels: string[];
  data: Array<{
    name: string;
    rank: number[];
  }>;
};

interface RankChartProps extends Pick<ChartProps, 'sx' | 'aspect'> {
  data: RankData;
  footnote?: string;
}

function compact (data: RankData): (rank: number) => [index: number, offset: number] {
  const cache: Array<[index: number, offset: number]> = [];
  const set = new Set<number>();
  let max = 0;
  data.data.forEach(({ rank }) => {
    rank.forEach(r => {
      set.add(r);
      max = Math.max(max, r);
    });
  });

  for (let i = 1, len = 0, off = 0.2; i <= max; i++) {
    if (set.has(i)) {
      len += 1;
      off = 0.2;
    } else {
      len += off;
      off *= 0.5;
    }
    cache[i] = [i, len];
  }

  return rank => {
    return cache[rank];
  };
}

export default function RankChart ({ data, footnote, ...props }: RankChartProps) {
  const comp = useMemo(() => compact(data), [data]);

  return (
    <Chart<'line'>
      type="line"
      {...props}
      data={{
        labels: data.labels,
        datasets: data.data.map((item, i) => {
          const d = item.rank.map(item => comp(item));
          return {
            data: d.map(d => d[1]),
            label: item.name,
            borderColor: defaultColors,
            borderWidth: 5,
            hoverBorderWidth: 5,
            pointBackgroundColor: defaultColors[i % defaultColors.length],
            pointBorderColor: defaultColors[i % defaultColors.length] + '80',
            pointHoverBorderColor: defaultColors[i % defaultColors.length] + '80',
            pointRadius: 8,
            pointHoverRadius: 8,
            pointBorderWidth: 4,
            pointHoverBorderWidth: 4,
            datalabels: {
              labels: {
                index: {
                  formatter: (_, ctx) => d[ctx.dataIndex][0],
                },
                label: {
                  formatter: () => item.name,
                  display: ctx => (ctx.dataIndex === d.length - 1),
                },
              },
            },
          };
        }),
      }}
      options={{
        layout: {
          padding: {
            right: 180,
          },
        },
        scales: {
          y: {
            reverse: true,
            grid: theme.grid.hidden,
            ticks: {
              display: false,
            },
            min: 0.5,
          },
          x: {
            position: 'top',
            ticks: {
              color: theme.color.ticks,
              font: theme.font.ticks,
            },
            grid: theme.grid.hidden,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          subtitle: theme.subtitle(footnote),
          datalabels: {
            labels: {
              index: {
                display: true,
                color: '#ffffff',
                anchor: 'center',
                align: 'center',
                font: {
                  size: 10,
                  weight: 'bold',
                },
              },
              label: {
                display: true,
                offset: responsive<number>([8, 12, 16]),
                anchor: 'center',
                align: 'right',
                color: ctx => defaultColors[ctx.datasetIndex % defaultColors.length],
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      }}
      plugins={[ChartDataLabels]}
    />
  );
}
