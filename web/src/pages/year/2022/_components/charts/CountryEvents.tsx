import React from "react";
import Chart, { ChartProps } from "@site/src/components/Chart";
import { defaultColors } from "@site/src/pages/year/2022/_components/charts/colors";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface CountryEventsProps extends Pick<ChartProps, 'sx'> {
  data: import('../../_charts/env').CountryData;
}

type EventPoint = {
  x: number
  y: number
  value: number
}

export default function CountryEvents({ data, sx }: CountryEventsProps) {
  return (
    <Chart<'scatter', EventPoint[]>
      type="scatter"
      sx={sx}
      data={{
        labels: data.labels,
        datasets: data.data.map(([country, code, ...items], i) => ({
          label: country,
          data: items.map((value: number, j) => ({
            x: j,
            y: i,
            value,
          })),
          backgroundColor: defaultColors[i % defaultColors.length],
        })),
      }}
      options={{
        font: {
          family: 'JetBrains Mono',
        },
        elements: {
          point: {
            pointStyle: 'rect',
            radius: 40,
            hoverRadius: 40,
            borderWidth: 4,
            backgroundColor: ctx => defaultColors[ctx.dataIndex] + '80',
            // hoverBackgroundColor: ctx => defaultColors[ctx.dataIndex],
          },
        },
        scales: {
          x: {
            min: -0.5,
            ticks: {
              callback: value => data.labels[value],
              padding: 16,
              align: 'start',
              color: '#E0E0E0',
              font: {
                size: 20,
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
              callback: value => `${data.data[value][1]}`,
              padding: 16,
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
          datalabels: {
            color: 'white',
            font: {
              weight: 'bold',
              size: 12,
              family: 'JetBrains Mono',
            },
            formatter: (value) => {
              return value.value + '%'
            },
            align: 'center',
            anchor: 'center',
          }
        },
      }}
      plugins={[ChartDataLabels]}
    />
  );
}