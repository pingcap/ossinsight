import { ChartResult } from '@site/src/api/explorer';
import EChart from '@site/src/components/ECharts';
import React, { useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { use } from 'echarts/core';
import { LinesChart } from 'echarts/charts';
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent } from 'echarts/components';

use([
  LinesChart,
  GridComponent,
  TitleComponent,
  DatasetComponent,
  LegendComponent,
]);

export default function LineChart ({ chartName, title, x, y, data }: ChartResult & { data: any[] }) {
  const options: EChartsOption = useMemo(() => ({
    dataset: {
      id: 'raw',
      source: data,
    },
    grid: {},
    series: {
      type: 'line',
      datasetId: 'raw',
      encode: {
        x,
        y,
      },
    },
    legend: {},
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
