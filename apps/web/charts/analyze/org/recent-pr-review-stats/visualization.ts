import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  recentStatsChartXAxis,
  recentStatsLineSeries,
  simpleGrid,
} from '@/lib/charts-utils/options';
import { getWidgetSize } from '@/lib/charts-utils/utils';

type Params = {
  owner_id: string;
  activity?: 'stars' | 'participants' | 'commits';
};

type DataPoint = {
  idx: number;
  current_period_day: string;
  current_period_day_total: number;
  past_period_day: string;
  past_period_day_total: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;
  const { activity = 'stars' } = ctx.parameters;

  const source = [...main.sort((a, b) => b.idx - a.idx)];

  // Server side rendering doesn't support decal
  // Canvas doesn't support full dom api(such as setAttribute) when setting echarts option
  const enableDecal = ctx.runtime === 'client';

  return {
    dataset: {
      source,
    },
    xAxis: {
      type: 'category',
      axisLine: {
        show: false,
      },
      // axisLabel: {
      //   show: false,
      // },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      show: false,
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          color: '#2a2a2c', type: 'dashed',
        },
      },
    },
    grid: {
      left: 2,
      top: 30,
      right: 20,
      bottom: 2,
      containLabel: true,
    },
    aria: enableDecal && {
      enabled: true,
      decal: {
        show: true,
      },
    },
    series: [
      {
        type: 'bar',
        name: 'Current period',
        encode: {
          x: 'current_period_day',
          y: 'current_period_day_total',
        },
        itemStyle: {
          decal: enableDecal && {
            symbol: 'none',
          },
          borderRadius: [2, 2, 0, 0],
          color: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0.75,
                color: '#ED5C53', // color at 75%
              },
              {
                offset: 1,
                color: '#CE7974', // color at 100%
              },
            ],
          },
        },
      },
      {
        type: 'bar',
        name: 'Last period',
        encode: {
          x: 'current_period_day',
          y: 'past_period_day_total',
        },
        itemStyle: {
          color: '#ED5C53',
          opacity: 0.5,
          borderRadius: [2, 2, 0, 0],
          decal: enableDecal && {
            color: 'rgba(0, 0, 0, 0.8)',
            dashArrayX: [1, 0],
            dashArrayY: [2, 5],
            symbolSize: 1,
            rotation: Math.PI / 6,
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      top: 0,
      itemWidth: 5,
      itemHeight: 5,
    },
  };
}

export const type = 'echarts';

export const grid = {
  cols: 9,
  rows: 3,
}
