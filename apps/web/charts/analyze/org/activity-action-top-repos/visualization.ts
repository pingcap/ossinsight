import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

import { simpleGrid } from '@/lib/charts-utils/options';
import { getWidgetSize } from '@/lib/charts-utils/utils';

type Params = {
  owner_id: string;
  activity?: string;
};

type IssueCommentsDataPoint = {
  repo_id: number;
  repo_name: string;
  issues: number;
  comments: number;
  comments_per_issue: number;
};

type ReviewCommentsDataPoint = {
  repo_id: number;
  repo_name: string;
  reviews: number;
  review_comments: number;
  comments_per_review: number;
};

type DataPoint = IssueCommentsDataPoint | ReviewCommentsDataPoint;

type Input = [DataPoint[], undefined];

const handleInputData = (data: DataPoint[], activity: string) => {
  switch (activity) {
    case 'reviews/review-comments':
      return [
        data.slice(0, 5).map((d) => ({
          ...d,
          x: d.repo_name,
        })),
        [
          {
            name: 'Reviews',
            type: 'bar',
            encode: {
              x: 'x',
              y: 'reviews',
            },
          },
          {
            name: 'Comments',
            type: 'bar',
            encode: {
              x: 'x',
              y: 'review_comments',
            },
          },
          {
            name: 'Comments per review',
            type: 'line',
            encode: {
              x: 'x',
              y: 'comments_per_review',
            },
            yAxisId: 'line',
          },
        ],
      ];
    case 'issues/issue-comments':
    default:
      return [
        data.slice(0, 5).map((d) => ({
          ...d,
          x: d.repo_name,
        })),
        [
          {
            name: 'Issues',
            type: 'bar',
            encode: {
              x: 'x',
              y: 'issues',
            },
          },
          {
            name: 'Comments',
            type: 'bar',
            encode: {
              x: 'x',
              y: 'comments',
            },
          },
          {
            name: 'Comments per Issue',
            type: 'line',
            encode: {
              x: 'x',
              y: 'comments_per_issue',
            },
            yAxisId: 'line',
          },
        ],
      ];
  }
};

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main] = data;
  const activity = ctx.parameters.activity ?? 'issues/issue-comments';

  const [dataset, series] = handleInputData(main, activity);

  return {
    dataset: {
      id: 'main',
      source: dataset,
    },
    grid: simpleGrid(2, true),
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    xAxis: {
      type: 'category',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
        alignWithLabel: true,
      },
      axisLabel: {
        formatter: (value: string) => {
          return value.split('/')[1];
        },
      },
      triggerEvent: true,
    },
    yAxis: [
      {
        id: 'bar',
        type: 'value',
        splitNumber: 4,
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#2a2a2c', type: 'dashed',
          },
        },
      },
      {
        id: 'line',
        type: 'value',
        splitNumber: 4,
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: series as any,
  };
}

export const eventHandlers = [
  {
    type: 'click',
    option: 'xAxis.category',
    handler: (params: any) => {
      if (params?.value) {
        window.open(`/analyze/${params.value}`);
      }
    },
  },
];

export const type = 'echarts';

export const grid = {
  cols: 6,
  rows: 3,
}
