import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

import { simpleGrid } from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
  activity?: string;
};

type DataPoint = {
  issue_closed_ratio: number;
  pr_merged_ratio: number;
  pr_reviewed_ratio: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;

  const activity = ctx.parameters.activity;
  const type = activity ? activity.replaceAll('-', '_') : 'issue_closed_ratio';

  const datapoint = main[0];
  const percentage = (datapoint as Record<string, number>)[type];

  const progressSize = Math.min(ctx.width || 100, ctx.height || 100) * 0.1;

  return {
    series: [
      {
        type: 'gauge',
        startAngle: 120,
        endAngle: -270,
        min: 0,
        max: 100,
        radius: '100%',
        itemStyle: {
          color: '#5972F8',
          // shadowColor: 'rgba(139, 163, 248, 1)',
          // shadowBlur: 10,
          // shadowOffsetX: 2,
          // shadowOffsetY: 2,
        },
        progress: {
          show: true,
          roundCap: true,
          width: progressSize,
        },
        pointer: { show: false },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: progressSize,
            color: [[1, '#CDD8F5']],
          },
        },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: '#2a2a2c', type: 'dashed' } },
        axisLabel: { show: false },
        title: {
          show: false,
        },
        detail: {
          offsetCenter: [0, 0],
          color: ctx.theme.colorScheme === 'light' ? 'black' : '#fff',
          fontSize: 16,
          lineHeight: 21,
          formatter: function (value) {
            return '' + value.toFixed(0) + '%';
          },
        },
        data: [
          {
            value: percentage,
          },
        ],
      },
    ],
  };
}

export const type = 'echarts';
