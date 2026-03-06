import { ChartResult } from '@/api/explorer';
import React, { useMemo } from 'react';
import { EChartsOption, SeriesOption } from 'echarts';
import EChartsReact from 'echarts-for-react';
import { isTimeField, transformTimeData } from '@/legacy-pages/explore/_components/charts/utils';

export default function BarChart ({ chartName, title, x, y, data }: ChartResult & { data: any[] }) {
  const { options, height }: { options: EChartsOption, height: number } = useMemo(() => {
    const isTime = isTimeField(x);
    data = isTime ? transformTimeData(data, x) : data;
    const isNotTime = !isTime;

    const makeSeries = function (y: string | string[]): SeriesOption[] {
      if (typeof y === 'string') {
        return [{
          type: 'bar',
          name: y,
          datasetId: 'raw',
          encode: {
            x: isNotTime ? y : x,
            y: isNotTime ? x : y,
          },
        }];
      } else {
        return y.flatMap(makeSeries);
      }
    };

    return {
      options: {
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
        tooltip: {},
        legend: {
          left: 'center',
          top: 28,
        },
        series: makeSeries(y),
        title: {
          text: title,
        },
        [isNotTime ? 'yAxis' : 'xAxis']: {
          type: isTime ? 'time' : 'category',
          inverse: isNotTime,
        },
        [isNotTime ? 'xAxis' : 'yAxis']: {
          type: 'value',
          position: isNotTime ? 'top' : undefined,
        },
        animationDuration: 2000,
      },
      height: Math.max(isNotTime ? 40 * data.length : 400, 400),
    };
  }, [chartName, title, x, y, data]);

  return (
    <EChartsReact
      theme="dark"
      style={{
        height,
      }}
      opts={{
        height,
      }}
      option={options}
    />
  );
}
