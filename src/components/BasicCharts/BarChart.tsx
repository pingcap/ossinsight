import React, {useMemo} from "react";
import {BarChart as EBarChart} from 'echarts/charts';
import {GridComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import {CanvasRenderer,} from 'echarts/renderers';
import * as echarts from "echarts/core";
import {Opts} from "echarts-for-react/lib/types";
import {EChartsOption} from "echarts";
import {TextCommonOption} from "echarts/types/src/util/types";
import ECharts from "../ECharts";

// Register the required components
echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, EBarChart, CanvasRenderer]
);

interface BarChartProps<T> {
  seriesName?: string
  data: T[]
  loading?: boolean
  clear?: boolean
  size: number
  n: number
  deps?: unknown[]
  categoryIndex: keyof T
  valueIndex: keyof T
  type?: 'repo' | 'owner' | 'lang' | false // for click
  rich?: Record<string, TextCommonOption>
}

export default function BarChart<T>({seriesName = 'Count', data, loading = false, clear = false, size, n, deps = [], categoryIndex, valueIndex, type = 'repo'}: BarChartProps<T>) {
  size = type === 'lang' ? 48 : size
  const options: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        containLabel: true,
        left: (clear ? 0 : 8) + (type === 'owner' ? 24 : 0),
        top: clear ? 0 : 16,
        bottom: clear ? 0 : 16
      },
      xAxis: {
        type: 'value',
        position: 'top'
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d[categoryIndex]),
        inverse: true,
        axisLabel: {
          rotate: 0,
          formatter: function (value, index) {
            switch (type) {
              case 'repo':
                return value
              case 'owner':
              case 'lang':
                return `${value} {${value.replace(/[+-]/g, '_')}|}`
              default:
                return value
            }
          },
          rich: (() => {
            switch (type) {
              case "owner":
                return data.reduce((p, c) => {
                  p[String(c[categoryIndex]).replace('-', '_')] = {
                    backgroundColor: {
                      image: `https://github.com/${c[categoryIndex]}.png`
                    },
                    width: 24,
                    height: 24
                  }
                  return p
                }, {} as Record<string, TextCommonOption>)
              case "lang":
                return data.reduce((p, c) => {
                  p[String(c[categoryIndex]).replace(/\+/g, '_')] = {
                    backgroundColor: {
                      image: '/img/lang/' + c[categoryIndex] + '.png'
                    },
                    width: 48,
                    height: 48
                  }
                  return p
                }, {} as Record<string, TextCommonOption>)
            }
          })()
        }
      },
      series: [
        {
          name: seriesName,
          data: data.map(d => d[valueIndex]),
          type: 'bar',
          barWidth: clear ? size / 2 : size,
        }
      ]
    }
  }, [data, ...deps, categoryIndex, valueIndex, size, clear])

  const height = useMemo(() => {
    const result = loading ? 400 : Math.max(Math.min(n, data.length), 5) * (size * (clear ? 1 : 1.5))

    return result
  }, [size, loading, clear])

  const onEvents = useMemo(() => {
    return {
      'click': params => {
        if (type === 'repo' && 'name' in params) {
          window.open(`https://github.com/${params.name}`)
        } else if (type === 'owner' && 'name' in params) {
          window.open(`https://github.com/${params.name}`)
        }
      }
    }
  }, [])

  return (
    <ECharts
      height={height}
      showLoading={loading}
      option={options}
      echarts={echarts}
      notMerge={false}
      lazyUpdate={true}
      style={{
        marginBottom: 16,
        borderRadius: 'var(--ifm-global-radius)',
      }}
      onEvents={onEvents}
    />
  )
}

interface BarChartLegacyProps {
  seriesName: string
  size: number
  categories: string[]
  values: number[]
}

export function BarChartLegacy({seriesName, categories, values, size}: BarChartLegacyProps) {
  const data = useMemo(() => {
    return categories.map((category, i) => ({
      category,
      value: values[i]
    }))
  }, [categories, values])

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
  )
}
