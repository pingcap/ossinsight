import { ChartResult } from '@site/src/api/explorer';
import EChart from '@site/src/components/ECharts';
import React, { useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { use } from 'echarts/core';
import { LinesChart as PieChartComponent } from 'echarts/charts';
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent } from 'echarts/components';

use([
  PieChartComponent,
  GridComponent,
  TitleComponent,
  DatasetComponent,
  LegendComponent,
]);

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
    <EChart
      height={400}
      option={options}
    />
  );
}
