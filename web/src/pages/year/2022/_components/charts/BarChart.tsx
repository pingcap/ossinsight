import Chart, { ChartProps } from "@site/src/components/Chart";
import React from "react";
import { defaultColors } from './colors';
import ChartDataLabels from 'chartjs-plugin-datalabels';


interface BarChartProps<T> extends Pick<ChartProps, 'fallbackImage' | 'name' | 'sx' | 'aspect'> {
  data: import("../../_charts/env").BarData<T>;
  footnote?: string;
}

export default function BarChart<T extends Record<string, any>>({
  data: { data, x, y, unit },
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
          subtitle: {
            position: 'bottom',
            align: 'end',
            text: footnote,
            display: !!footnote,
            color: '#7C7C7C',
            padding: 32,
            font: {
              family: 'JetBrains Mono',
              size: 13,
            },
          },
          legend: {
            display: false,
          },
          title: {
            display: !!props.name,
            position: 'top',
            text: props.name,
          },
          tooltip: {
            enabled: false,
          },
          datalabels: {
            color: 'white',
            font: {
              weight: 'bold',
              size: 20,
              family: 'JetBrains Mono',
            },
            formatter: (value, context) => {
              return `${data[context.dataIndex][y]}: ${value}${unit ?? ''}`;
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