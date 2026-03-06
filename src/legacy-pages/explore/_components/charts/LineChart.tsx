import { ChartResult } from '@/api/explorer';
import React, { useMemo } from 'react';
import { EChartsOption, SeriesOption } from 'echarts';
import EChartsReact from 'echarts-for-react';
import { isTimeField, transformTimeData } from '@/legacy-pages/explore/_components/charts/utils';

export default function LineChart ({ chartName, title, x, y, data }: ChartResult & { data: any[] }) {
  const options: EChartsOption = useMemo(() => {
    const isTime = isTimeField(x);
    data = isTime ? transformTimeData(data, x) : data;

    const makeSeries = function (y: string | string[]): SeriesOption[] {
      if (typeof y === 'string') {
        return [{
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
        }];
      } else {
        return y.flatMap(makeSeries);
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
        top: 28,
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
      animationDuration: 2000,
    });
  }, [chartName, title, x, y, data]);
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
