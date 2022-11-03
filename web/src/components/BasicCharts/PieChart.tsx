import * as React from 'react';
import { useMemo } from 'react';
import { TextCommonOption } from 'echarts/types/src/util/types';
import type { EChartsOption, PieSeriesOption } from 'echarts';
import ECharts from '../ECharts';
import { useIsDarkTheme } from '@site/src/hooks/theme';
import { notNullish } from '@site/src/utils/value';

export interface PieChartProps<T> {
  seriesName?: string;
  data: T[];
  compareData?: T[];
  compareName?: string;
  loading?: boolean;
  deps?: unknown[];
  categoryIndex: keyof T;
  valueIndex: keyof T;
  type?: 'repo' | 'owner' | 'lang' | false; // for click
  rich?: Record<string, TextCommonOption>;
}

function usePieSeries (isDarkTheme: boolean): PieSeriesOption {
  return useMemo(() => ({
    type: 'pie',
    radius: ['35%', '65%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderColor: isDarkTheme ? '#1e1e1f' : '#ffffff',
      borderWidth: 0,
    },
    label: {
      show: false,
      position: 'center',
      formatter: '{b}: {d}%',
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '20',
        fontWeight: 'bold',
        formatter: '{b}\n\n{c}',
      },
    },
    labelLine: {
      show: false,
    },
  }), [isDarkTheme]);
}

export default function PieChart<T> ({
  seriesName,
  loading,
  data,
  compareData,
  categoryIndex,
  valueIndex,
  deps = [],
}: PieChartProps<T>) {
  const isDarkTheme = useIsDarkTheme();
  const basicOption = usePieSeries(isDarkTheme);

  const series: EChartsOption['series'] = useMemo(() => {
    const series: PieSeriesOption[] = [];
    const baseSeries: PieSeriesOption = {
      ...basicOption,
      name: seriesName,
      data: data.map((item) => {
        const name = item[categoryIndex];
        const value = item[valueIndex];

        return {
          value: value as unknown as number,
          name: name as unknown as string,
        };
      }),
    };

    series.push(baseSeries);

    if (notNullish(compareData)) {
      baseSeries.center = ['25%', '55%'];

      const compareSeries = {
        ...basicOption,
        name: seriesName,
        center: ['65%', '55%'],
        data: compareData.map((item) => {
          const name = item[categoryIndex];
          const value = item[valueIndex];

          return {
            value: value as unknown as number,
            name: name as unknown as string,
          };
        }),
      };
      series.push(compareSeries);
    }

    return series;
  }, [basicOption, data, compareData, ...deps, categoryIndex, valueIndex]);

  const options: EChartsOption = useMemo(() => {
    return {
      tooltip: Object.assign({
        trigger: 'item',
      }),
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: '20px',
        top: 20,
        bottom: 20,
        x: 'right',
        formatter: '{name}',
      },
      series,
      grid: {
        left: 16,
        top: 16,
        bottom: 16,
        right: 16,
        containLabel: true,
      },
    };
  }, [series]);

  return (
    <ECharts
      aspectRatio={16 / 9}
      showLoading={loading}
      option={options}
      notMerge={false}
      lazyUpdate={true}
    />
  );
}
