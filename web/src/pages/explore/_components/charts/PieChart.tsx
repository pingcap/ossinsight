import { ChartResult } from '@site/src/api/explorer';
import React, { useMemo } from 'react';
import { EChartsOption } from 'echarts';
import EChartsReact from 'echarts-for-react';

export default function PieChart ({ chartName, title, value, label, data }: ChartResult & { data: any[] }) {
  const options: EChartsOption = useMemo(() => ({
    backgroundColor: 'rgb(36, 35, 43)',
    dataset: {
      id: 'raw',
      source: data,
    },
    grid: {
      top: 64,
      left: 8,
      right: 8,
      bottom: 8,
    },
    tooltip: {},
    legend: {
      left: 8,
      top: 8,
      height: '90%',
      type: 'scroll',
      orient: 'vertical',
    },
    series: {
      type: 'pie',
      top: 36,
      name: label,
      datasetId: 'raw',
      encode: {
        itemName: label,
        value,
      },
    },
    title: {
      text: title,
    },
  }), [chartName, title, value, label, data]);
  return (
    <EChartsReact
      theme="dark"
      style={{
        height: 400,
      }}
      opts={{
        height: 400,
      }}
      option={options}
    />
  );
}
