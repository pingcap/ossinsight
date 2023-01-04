import { ChartResult } from '@site/src/api/explorer';
import EChart from '@site/src/components/ECharts';
import React, { useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { use } from 'echarts/core';
import { BarChart as EBarChart } from 'echarts/charts';
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent } from 'echarts/components';

use([
  EBarChart,
  GridComponent,
  TitleComponent,
  DatasetComponent,
  LegendComponent,
]);

export default function BarChart ({ chartName, title, x, y, data }: ChartResult & { data: any[] }) {
  const options: EChartsOption = useMemo(() => ({
    dataset: {
      id: 'raw',
      source: data,
    },
    backgroundColor: 'rgb(36, 35, 43)',
    grid: {
      top: 64,
      left: 8,
      right: 8,
      bottom: 8,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      left: 8,
      top: 8,
    },
    series: {
      type: 'bar',
      name: y,
      datasetId: 'raw',
      encode: {
        x,
        y,
      },
    },
    title: {
      text: title,
    },
    xAxis: {
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
  }), [chartName, title, x, y]);
  return (
    <EChart
      height={400}
      option={options}
    />
  );
}
