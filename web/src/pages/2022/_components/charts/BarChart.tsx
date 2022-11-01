import Chart, { ChartProps } from "@site/src/components/Chart";
import React from "react";
import { defaultColors } from './colors';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { responsive } from "./responsive";
import theme from "./theme";


interface BarChartProps<T> extends Pick<ChartProps, 'fallbackImage' | 'name' | 'sx' | 'aspect'> {
  data: import("../../_charts/env").BarData<T>;
  footnote?: string;
}

export default function BarChart<T extends Record<string, any>>({
  data: { data, x, y, unit, postfix },
  footnote,
  ...props
}: BarChartProps<T>) {
  return (
    <Chart<"bar">
      once
      {...props}
      type="bar"
      data={{
        labels: data.map(item => item[y]),
        datasets: [{
          data: data.map(item => item[x]),
          backgroundColor: defaultColors,
          borderRadius: 6,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            display: false,
            reverse: true,
          },
          y: {
            display: false,
          },
        },
        plugins: {
          title: theme.title(props.name),
          subtitle: theme.subtitle(footnote),
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          datalabels: {
            color: 'white',
            font: responsive({
              size: [12, 14, 16],
              weight: [undefined, 'bold', 'bold'],
            }),
            formatter: (value, context) => {
              return `${data[context.dataIndex][y]}: ${value}${unit ?? ''}${postfix ? ` ${data[context.dataIndex][postfix]}` : ''}`;
            },
            anchor: 'end',
            clamp: true,
            textAlign: 'start',
            align: 'start',
          },
        },
      }}
      plugins={[
        ChartDataLabels,
      ]}
    />
  );
}