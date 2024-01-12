import type { EChartsOption } from 'echarts';
import { TextCommonOption } from 'echarts/types/src/util/types';
import React, { useMemo } from 'react';
import ECharts from '../ECharts';
import { KeyOfType } from '../../dynamic-pages/analyze/charts/options/utils/data';

interface BarChartProps<T> {
  seriesName?: string;
  data: T[];
  loading?: boolean;
  clear?: boolean;
  size: number;
  n: number;
  deps?: unknown[];
  categoryIndex: KeyOfType<T, string>;
  valueIndex: KeyOfType<T, number>;
  type?: 'repo' | 'owner' | 'lang' | false; // for click
  rich?: Record<string, TextCommonOption>;
}

const getGithubAvatar = (src: string) => {
  if (src.includes('[bot]')) {
    return 'https://github.com/github.png';
  } else {
    return `https://github.com/${src}.png`;
  }
};

export default function BarChart<T> ({ seriesName = 'Count', data, loading = false, clear = false, size, n, deps = [], categoryIndex, valueIndex, type = 'repo' }: BarChartProps<T>) {
  size = type === 'lang' ? 48 : size;
  const options: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        containLabel: true,
        left: (clear ? 0 : 8) + (type === 'owner' ? 24 : 0),
        top: clear ? 0 : 16,
        bottom: clear ? 0 : 16,
      },
      xAxis: {
        type: 'value',
        position: 'top',
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d[categoryIndex]),
        inverse: true,
        axisLabel: {
          rotate: 0,
          formatter: function (value: string, index) {
            switch (type) {
              case 'repo':
                return value;
              case 'owner':
              case 'lang':
                return `${value} {${value.replace(/[+-[\]]/g, '_')}|}`;
              default:
                return value;
            }
          },
          rich: (() => {
            switch (type) {
              case 'owner':
                return data.reduce<Record<string, TextCommonOption>>((p, c) => {
                  p[String(c[categoryIndex]).replace(/[-[\]]/g, '_')] = {
                    backgroundColor: {
                      image: getGithubAvatar(`${c[categoryIndex] as string}`),
                    },
                    width: 24,
                    height: 24,
                  };
                  return p;
                }, {});
              case 'lang':
                return data.reduce<Record<string, TextCommonOption>>((p, c) => {
                  p[String(c[categoryIndex]).replace(/\+/g, '_')] = {
                    backgroundColor: {
                      image: `/img/lang/${c[categoryIndex] as string}.png`,
                    },
                    width: 48,
                    height: 48,
                  };
                  return p;
                }, {});
            }
          })(),
        },
      },
      series: [
        {
          name: seriesName,
          data: data.map(d => d[valueIndex] as number),
          type: 'bar',
          barWidth: clear ? size / 2 : size,
        },
      ],
    };
  }, [data, ...deps, categoryIndex, valueIndex, size, clear]);

  const height = useMemo(() => {
    const result = loading ? 400 : Math.max(Math.min(n, data.length), 5) * (size * (clear ? 1 : 1.5));

    return result;
  }, [size, loading, clear]);

  const onEvents = useMemo(() => {
    return {
      click: (params) => {
        if (type === 'repo' && 'name' in params) {
          window.open(`https://github.com/${params.name as string}`);
        } else if (type === 'owner' && 'name' in params) {
          window.open(`https://github.com/${params.name as string}`);
        }
      },
    };
  }, []);

  return (
    <ECharts
      height={height}
      showLoading={loading}
      option={options}
      notMerge={false}
      lazyUpdate={true}
      style={{
        marginBottom: 16,
        borderRadius: 'var(--ifm-global-radius)',
      }}
      onEvents={onEvents}
    />
  );
}

interface BarChartLegacyProps {
  seriesName: string;
  size: number;
  categories: string[];
  values: number[];
}

export function BarChartLegacy ({ seriesName, categories, values, size }: BarChartLegacyProps) {
  const data = useMemo(() => {
    return categories.map((category, i) => ({
      category,
      value: values[i],
    }));
  }, [categories, values]);

  return (
    <BarChart
      seriesName={seriesName}
      data={data}
      size={size}
      n={categories.length}
      deps={[]}
      categoryIndex='category'
      valueIndex='value'
      clear={false}
    />
  );
}
