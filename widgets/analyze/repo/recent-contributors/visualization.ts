import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  recentStatsChartXAxis,
  recentStatsLineSeries, simpleGrid,
} from '@/lib/widgets-utils/options';

type Params = {
  repo_id: string;
};

type DataPoint = {
  current_period_day: string;
  current_period_day_contributors: number;
  current_period_contributors: number;
  idx: number;
  last_period_day: string;
  last_period_day_contributors: number;
  last_period_contributors: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;

  return {
    dataset: {
      source: [...main.sort((a, b) => a.idx - b.idx)],
    },
    xAxis: recentStatsChartXAxis(),
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: simpleGrid(2),
    series: [recentStatsLineSeries(
      'idx',
      'current_period_day_contributors',
      {
        name: 'Contributors',
        lineStyle: {
          color: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0.75,
                color: '#FBE4C1', // color at 75%
              },
              {
                offset: 1,
                color: '#FFD799', // color at 100%
              },
            ],
          },
        },
      }
    ), recentStatsLineSeries(
      'idx',
      'last_period_day_contributors',
      {
        name: 'Last period',
        color: '#F3DDBB80',
        lineStyle: {
          type: 'dashed',
          color: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: '#F3DDBB80', // color at 100%
              },
            ],
          },
        },
      }
    ),],
    tooltip: {
      show: false,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
  };
}

export const type = 'echarts';
