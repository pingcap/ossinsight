import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  grid,
  recentStatsChartXAxis,
  recentStatsLineSeries, simpleGrid,
} from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
};

type DataPoint = {
  idx: number;
  current_period_day: string;
  current_period_merged_day_prs: number;
  current_period_merged_prs: number;
  current_period_opened_day_prs: number;
  current_period_opened_prs: number;
  last_period_day: string;
  last_period_merged_day_prs: number;
  last_period_merged_prs: number;
  last_period_opened_day_prs: number;
  last_period_opened_prs: number;
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
      recentStatsLineSeries(
        'idx',
        'current_period_opened_day_prs',
        {
          name: 'Current period',
          color: '#D1F935',
          lineStyle: {
            color: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.75,
                  color: '#D1F935', // color at 75%
                },
                {
                  offset: 1,
                  color: '#ADB980', // color at 100%
                },
              ],
            },
          },
        }
      ),
      recentStatsLineSeries(
        'idx',
        'last_period_merged_day_prs',
        {
          name: 'Last period',
          color: '#BCCE7480',
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
                  color: '#BCCE7480', // color at 100%
                },
              ],
            },
          },
        }
      ),
      // {
      //   type: 'line',
      //   showSymbol: false,
      //   encode: {
      //     x: 'current_period_day',
      //     y: 'current_period_opened_day_prs',
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
      //     y: 'current_period_merged_day_prs',
      //   },
      //   smooth: true,
      //   color: ctx.theme.colors.indigo['400'],
      //   name: 'Merged',
      // },
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
