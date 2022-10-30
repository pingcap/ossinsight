import Chart, { ChartProps } from "@site/src/components/Chart";
import React, { useMemo } from "react";
import { defaultColors } from "@site/src/pages/year/2022/_components/charts/colors";
import ChartDataLabels from "chartjs-plugin-datalabels";

type RankData = {
  labels: string[]
  data: {
    name: string
    rank: number[]
  }[]
}

interface RankChartProps extends Pick<ChartProps, 'sx' | 'aspect'> {
  data: RankData;
}

function compact(data: RankData): (rank: number) => [index: number, offset: number] {
  const cache: [index: number, offset: number][] = [];
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
    console.log('get', cache[rank]);
    return cache[rank];
  };
}

export default function RankChart({ data, ...props }: RankChartProps) {
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
            pointRadius: 8,
            hoverPointRadius: 8,
            datalabels: {
              labels: {
                index: {
                  formatter: (_, ctx) => d[ctx.dataIndex][0],
                },
                label: {
                  formatter: () => item.name,
                  display: ctx => (ctx.dataIndex === d.length - 1),
                }
              }
            },
          };
        }),
      }}
      options={{
        layout: {
          padding: {
            right: 180
          }
        },
        scales: {
          y: {
            reverse: true,
            grid: {
              display: false,
              borderColor: 'rgba(0,0,0,0)',
            },
            ticks: {
              display: false,
            },
            min: 0.5,
          },
          x: {
            position: 'top',
            ticks: {
              color: '#E0E0E0',
              font: {
                size: 20,
              },
            },
            grid: {
              display: false,
              borderColor: 'rgba(0,0,0,0)',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          datalabels: {
            labels: {
              index: {
                display: true,
                color: '#ffffff',
              },
              label: {
                display: true,
                offset: 16,
                anchor: 'center',
                align: 'right',
                color: ctx => defaultColors[ctx.datasetIndex % defaultColors.length],
                font: {
                  size: 16,
                },
              }
            },
          },
        },
      }}
      plugins={[ChartDataLabels]}
    />
  );
}