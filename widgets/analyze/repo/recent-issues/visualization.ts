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
  idx: number;
  current_period_closed_day_issues: number;
  current_period_closed_issues: number;
  current_period_day: string;
  current_period_opened_day_issues: number;
  current_period_opened_issues: number;
  last_period_closed_day_issues: number;
  last_period_closed_issues: number;
  last_period_day: string;
  last_period_opened_day_issues: number;
  last_period_opened_issues: number;
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
    series: [
      // {
      //   type: 'line',
      //   showSymbol: false,
      //   encode: {
      //     x: 'current_period_day',
      //     y: 'current_period_opened_day_issues',
      //   },
      //   smooth: true,
      //   color: ctx.theme.colors.green['400'],
      //   name: 'Opened',
      // },
      // {
      //   type: 'line',
      //   showSymbol: false,
      //   encode: {
      //     x: 'current_period_day',
      //     y: 'current_period_closed_day_issues',
      //   },
      //   smooth: true,
      //   color: ctx.theme.colors.indigo['400'],
      //   name: 'Merged',
      // },
      recentStatsLineSeries(
        'idx',
        'current_period_opened_day_issues',
        {
          name: 'Current period',
          color: '#7378FF',
          lineStyle: {
            color: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.75,
                  color: '#7378FF', // color at 75%
                },
                {
                  offset: 1,
                  color: '#A0A3FB', // color at 100%
                },
              ],
            },
          },
        }
      ),
      recentStatsLineSeries(
        'idx',
        'last_period_closed_day_issues',
        {
          name: 'Last period',
          color: '#A0A3FB80',
          lineStyle: {
            type: 'dashed',
            color: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.5,
                  color: '#A0A3FB80', // color at 100%
                },
              ],
            },
          },
        }
      ),
    ],
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

export function onSizeChange(
  instance: any,
  result: any,
  width: number,
  height: number
) {
  instance.resize({ width, height });
}
