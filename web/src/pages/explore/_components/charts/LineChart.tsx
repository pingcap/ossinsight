import { ChartResult } from '@site/src/api/explorer';
import EChart from '@site/src/components/ECharts';
import React, { useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { use } from 'echarts/core';
import { LinesChart } from 'echarts/charts';
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';

use([
  LinesChart,
  GridComponent,
  TitleComponent,
  DatasetComponent,
  LegendComponent,
  TooltipComponent,
]);

export default function LineChart ({ chartName, title, x, y, data }: ChartResult & { data: any[] }) {
  const options: EChartsOption = useMemo(() => {
    const isTime = /date|time|year|month/.test(x);

    const makeSeries = function (y: string | string[]) {
      if (typeof y === 'string') {
        return {
          type: 'line',
          datasetId: 'raw',
          name: y,
          encode: {
            x,
            y,
          },
          itemStyle: {
            opacity: 0,
          },
        };
      } else {
        return y.map(makeSeries);
      }
    };

    return ({
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
        left: 'center',
        top: 24,
      },
      series: makeSeries(y),
      title: {
        text: title,
      },
      xAxis: {
        type: isTime ? 'time' : 'category',
      },
      yAxis: {
        type: 'value',
      },
    });
  }, [chartName, title, x, y]);
  return (
    <EChart
      height={400}
      option={options}
    />
  );
}
