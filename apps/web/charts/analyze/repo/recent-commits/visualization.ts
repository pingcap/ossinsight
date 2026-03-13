import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

import {
  simpleGrid,
} from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
};

type DataPoint = {
  idx: number;
  current_period_commits: number;
  current_period_day: string;
  current_period_day_commits: number;
  last_period_commits: number;
  last_period_day: string;
  last_period_day_commits: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>,
): EChartsVisualizationConfig {
  const [main, vs] = data;

  return {
    dataset: {
      source: [...main.sort((a, b) => a.idx - b.idx)],
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
    },
    grid: simpleGrid(2),
    series: {
      type: 'bar',
      encode: {
        x: 'current_period_day',
        y: 'current_period_day_commits',
      },
      color: ctx.theme.colors.sky['400'],
      name: 'Commit(s)',
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
  };
}

export const type = 'echarts';
