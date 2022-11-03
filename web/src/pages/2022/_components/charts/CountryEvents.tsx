import React from 'react';
import Chart, { ChartProps } from '@site/src/components/Chart';
import { defaultColors } from './colors';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useIsLarge from '../hooks/useIsLarge';
import { ScriptableContext } from 'chart.js';
import countryCodeEmoji from 'country-code-emoji';
import ChartJs from 'chart.js/auto';
import { responsive } from './responsive';
import theme from './theme';
import { notFalsy } from '@site/src/utils/value';

interface CountryEventsProps extends Pick<ChartProps, 'sx'> {
  data: import('../../_charts/env').CountryData;
  footnote?: string;
}

type EventPoint = {
  x: number;
  y: number;
  value: number;
  country: string;
  code: string;
};

function isHighlight (data: import('../../_charts/env').CountryData, ctx: Pick<ScriptableContext<any>, 'dataIndex' | 'datasetIndex'>) {
  return data.highlights?.[ctx.datasetIndex]?.includes(ctx.dataIndex) ?? false;
}

function scatterSize (chart: ChartJs, maxWidth: number, count: number) {
  count += 2;
  return Math.min((((chart.chartArea?.width ?? chart.width) - (count - 1) * 4)) / count, maxWidth);
}

export default function CountryEvents ({ data, footnote, sx }: CountryEventsProps) {
  const large = useIsLarge();

  return (
    <Chart<'scatter', EventPoint[]>
      type="scatter"
      sx={sx}
      aspect={large ? 9 / 12 : 3 / 5}
      data={{
        labels: data.labels,
        datasets: data.data.map(([country, code, ...items], i) => ({
          label: country,
          data: items.map((value: number, j) => ({
            x: j,
            y: i,
            value,
            country,
            code,
          })),
        })),
      }}
      options={{
        elements: {
          point: {
            pointStyle: 'rect',
            radius: ctx => {
              const size = scatterSize(ctx.chart, 30, data.labels.length);
              if (isHighlight(data, ctx)) {
                return size;
              } else {
                return Math.sqrt((ctx.dataset.data[ctx.dataIndex] as EventPoint).value / 100) * size;
              }
            },
            hoverRadius: ctx => scatterSize(ctx.chart, 30, data.labels.length),
            borderWidth: responsive([0, 2, 4]),
            hoverBorderWidth: responsive([0, 2, 4]),
            borderColor: ctx => {
              if (isHighlight(data, ctx)) {
                return defaultColors[ctx.datasetIndex % defaultColors.length] + '80';
              } else {
                return '#4D4D4D80';
              }
            },
            backgroundColor: ctx => {
              if (isHighlight(data, ctx)) {
                return defaultColors[ctx.datasetIndex % defaultColors.length] + '80';
              } else {
                return '#4D4D4D';
              }
            },
            hoverBorderColor: ctx => defaultColors[ctx.datasetIndex % defaultColors.length] + '80',
            hoverBackgroundColor: ctx => defaultColors[ctx.datasetIndex % defaultColors.length],
          },
        },
        scales: {
          x: {
            min: -1,
            ticks: {
              callback: value => data.labels[value],
              padding: 16,
              align: 'start',
              color: theme.color.ticks,
              font: theme.font.ticks,
            },
            position: 'top',
            grid: theme.grid.hidden,
          },
          y: {
            reverse: true,
            max: data.labels.length + 1,
            ticks: {
              callback: value => {
                const code = data.data[value]?.[1];
                return notFalsy(code) ? countryCodeEmoji(code) : undefined;
              },
              padding: 16,
              color: theme.color.ticks,
              font: {
                size: 28,
              },
            },
            grid: theme.grid.hidden,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            bodyFont: theme.font.tooltipBody,
            padding: 16,
            callbacks: {
              label: (item) => {
                const event = data.labels[item.dataIndex];
                const { value, code } = item.dataset.data[item.dataIndex] as EventPoint;
                return `${event} from ${countryCodeEmoji(code)}: ${value}${data.unit}`;
              },
            },
          },
          datalabels: {
            color: 'white',
            font: responsive({
              size: [8, 10, 12],
              weight: ['normal', 'bold'],
            }),
            formatter: (value) => {
              return `${value.value as string}%`;
            },
            align: 'center',
            anchor: 'center',
            display: (ctx) => {
              return ctx.active || isHighlight(data, ctx);
            },
          },
          subtitle: theme.subtitle(footnote),
        },
      }}
      plugins={[ChartDataLabels]}
    />
  );
}
