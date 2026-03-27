import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  recentStatsChartXAxis,
  recentStatsLineSeries, simpleGrid,
} from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
};

type DataPoint = {
  current_period_day: string;
  current_period_day_stars: number;
  current_period_stars: number;
  idx: number;
  last_period_day: string;
  last_period_day_stars: number;
  last_period_stars: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params & {
    options?: {
      unit?: string;
    }
  }>
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
      recentStatsLineSeries('idx', 'current_period_day_stars', {
        name: 'Stars',
        lineStyle: {
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
      }),
      recentStatsLineSeries('idx', 'last_period_day_stars', {
        name: 'Last period',
        color: '#CE797480',
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
                color: '#CE797480', // color at 100%
              },
            ],
          },
        },
      }),
    ],
    tooltip: {
      show: true,
      trigger: 'axis',
      position: function (pos, params, dom, rect, size) {
        // tooltip will be fixed on the right if mouse hovering on the left,
        // and on the left if hovering on the right.
        var obj: Record<string, number> = { top: -20 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      formatter: (params) => {
        const [a, b] = params as any[];
        const unit = ctx.parameters?.options?.unit || 'Star(s)';
        return `<p class="text-white">
        <div class="text-xs text-white"><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #E2635B; margin-right: 5px;"></span>${a?.data?.current_period_day}</div>
        <div class="text-md text-white">${a?.data?.current_period_day_stars} ${unit}</div>
        </p>
        <hr class="my-1" />
        <p class="text=[#8A8A8A]">
        <div class="text-xs text=[#8A8A8A]"><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #D3B8B6; margin-right: 5px;"></span>${b?.data?.last_period_day}</div>
        <div class="text-md text=[#8A8A8A]">${b?.data?.last_period_day_stars} ${unit}</div>
        </p>`;
      },
      axisPointer: {
        type: 'line',
      },
    },
  };
}

export const type = 'echarts';
