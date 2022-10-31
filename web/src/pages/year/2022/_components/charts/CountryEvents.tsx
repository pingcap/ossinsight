import React from "react";
import Chart, { ChartProps } from "@site/src/components/Chart";
import { defaultColors } from "@site/src/pages/year/2022/_components/charts/colors";
import ChartDataLabels from "chartjs-plugin-datalabels";
import useIsLarge from "@site/src/pages/year/2022/_components/hooks/useIsLarge";
import { ScriptableContext } from "chart.js";
import countryCodeEmoji from "country-code-emoji";

interface CountryEventsProps extends Pick<ChartProps, 'sx'> {
  data: import('../../_charts/env').CountryData;
}

type EventPoint = {
  x: number
  y: number
  value: number
  country: string
  code: string
}

function isHighlight(data: import('../../_charts/env').CountryData, ctx: Pick<ScriptableContext<any>, 'dataIndex' | 'datasetIndex'>) {
  return data.highlights?.[ctx.datasetIndex]?.includes(ctx.dataIndex) ?? false;
}

export default function CountryEvents({ data, sx }: CountryEventsProps) {
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
        font: {
          family: 'JetBrains Mono',
        },
        elements: {
          point: {
            pointStyle: 'rect',
            radius: ctx => {
              if (isHighlight(data, ctx)) {
                return 30
              } else {
                return Math.sqrt((ctx.dataset.data[ctx.dataIndex] as EventPoint).value / 100) * 30;
              }
            },
            hoverRadius: 30,
            borderWidth: 4,
            hoverBorderWidth: 4,
            borderColor: ctx => {
              if (isHighlight(data, ctx)) {
                return defaultColors[ctx.datasetIndex % defaultColors.length] + '80';
              } else {
                return '#4D4D4D80';
              }
            },
            backgroundColor:ctx => {
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
              color: '#E0E0E0',
              font: {
                size: 12,
              },
            },
            position: 'top',
            grid: {
              display: false,
              borderColor: 'rgba(0,0,0,0)',
            },
          },
          y: {
            reverse: true,
            ticks: {
              callback: value => {
                const code = data.data[value]?.[1]
                return code && countryCodeEmoji(code);
              },
              padding: 16,
              color: '#E0E0E0',
              font: {
                size: 28,
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
            enabled: true,
            displayColors: false,
            bodyFont: {
              size: 16
            },
            padding: 16,
            callbacks: {
              label: (item) => {
                const event = data.labels[item.dataIndex]
                const { country, value, code } = item.dataset.data[item.dataIndex] as EventPoint
                return `${event} from ${country} ${countryCodeEmoji(code)}: ${value}${data.unit}`;
              }
            }
          },
          datalabels: {
            color: 'white',
            font: {
              weight: 'bold',
              size: 12,
              family: 'JetBrains Mono',
            },
            formatter: (value) => {
              return value.value + '%';
            },
            align: 'center',
            anchor: 'center',
            display: (ctx) => {
              return ctx.active || isHighlight(data, ctx);
            },
          },
        },
      }}
      plugins={[ChartDataLabels]}
    />
  );
}