import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

import { simpleGrid } from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
  activity?: string;
};

type PRMergedDataPoint = {
  current_period_percentage: number;
  current_period_prs: number;
  past_period_percentage: number;
  past_period_prs: number;
  percentage_change: number;
  type: 'merged' | 'open' | 'closed';
};

type PRSelfMergedDataPoint = {
  current_period_percentage: number;
  current_period_prs: number;
  past_period_percentage: number;
  past_period_prs: number;
  percentage_change: number;
  type: 'self-merged' | 'others';
};

type IssueClosedDataPoint = {
  current_period_issues: number;
  current_period_percentage: number;
  past_period_issues: number;
  past_period_percentage: number;
  percentage_change: number;
  type: 'un-closed' | 'self-closed' | 'others-closed';
};

type TransformedIssueClosedDataPoint = Omit<IssueClosedDataPoint, 'type'> & {
  type: 'open' | 'self-closed' | 'others-closed';
}

type ReviewedDataPoint = {
  type: 'reviewed' | 'un-reviewed';
  current_period_prs: number;
  current_period_percentage: number;
  past_period_prs: number;
  past_period_percentage: number;
  percentage_change: number;
};

type DataPoint = PRMergedDataPoint | PRSelfMergedDataPoint | IssueClosedDataPoint | ReviewedDataPoint;

type Input = [DataPoint[], undefined];

const transformIssueClosedData = (
  data: IssueClosedDataPoint[]
): TransformedIssueClosedDataPoint[] => {
  return data.map((item) => {
    return {
      ...item,
      type: item.type === 'un-closed' ? 'open' : item.type,
    };
  });
};

const handleData = (items: DataPoint[], activity: string) => {
  switch (activity) {
    case 'issues/closed':
      return transformIssueClosedData(items as IssueClosedDataPoint[]).map((item, idx) => {
        const issueClosedData = item as IssueClosedDataPoint;
        return {
          name: issueClosedData.type,
          value: issueClosedData.current_period_issues,
          itemStyle: styleMap[idx].itemStyle,
        };
      });
    case 'reviews/reviewed':
      return items.map((item, idx) => {
        const reviewedData = item as ReviewedDataPoint;
        return {
          name: reviewedData.type,
          value: reviewedData.current_period_prs,
          itemStyle: styleMap[idx].itemStyle,
        };
      });
    case 'pull-requests/merged':
      return items.map((item, idx) => {
        const prMergedData = item as PRMergedDataPoint;
        return {
          name: prMergedData.type,
          value: prMergedData.current_period_prs,
          itemStyle: {
            color: prStyleRecord[prMergedData.type],
          },
        };
      });
    default:
      return items.map((item, idx) => {
        const prMergedData = item as PRMergedDataPoint;
        return {
          name: prMergedData.type,
          value: prMergedData.current_period_prs,
          itemStyle: styleMap[idx].itemStyle,
        };
      });
  }
};

const calcSumFromData = (data: DataPoint[], activity: string) => {
  switch (activity) {
    case 'issues/closed':
      return transformIssueClosedData(data as IssueClosedDataPoint[]).reduce(
        (acc, cur) => {
          acc[0] += cur.current_period_issues;
          acc[1] += cur.past_period_issues;
          return acc;
        },
        [0, 0]
      );
    case 'reviews/reviewed':
      return (data as ReviewedDataPoint[]).reduce(
        (acc, cur) => {
          acc[0] += cur.current_period_prs;
          acc[1] += cur.past_period_prs;
          return acc;
        },
        [0, 0]
      );
    case 'pull-requests/merged':
    default:
      return (data as PRMergedDataPoint[]).reduce(
        (acc, cur) => {
          acc[0] += cur.current_period_prs;
          acc[1] += cur.past_period_prs;
          return acc;
        },
        [0, 0]
      );
  }
};

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;
  const activity = ctx.parameters.activity ?? 'pull-requests/merged';

  const handledData = handleData(main, activity);
  const sum = calcSumFromData(main, activity);

  return {
    tooltip: {
      trigger: 'item',
      position: function (pos, params, dom, rect, size) {
        // tooltip will be fixed on the right if mouse hovering on the left,
        // and on the left if hovering on the right.
        var obj: Record<string, number> = { top: 60 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        return obj;
      },
      formatter: (params) => {
        const { name, value } = params as any;
        if (activity === 'pull-requests/self-merged' && name === 'self-merged') {
          return `<b>${name}</b>
            <div>${value} PRs(${((value / sum[0]) * 100).toFixed(0)}%)</div>
            <br />
            <div style="color:grey;font-size: smaller;white-space: break-spaces;line-height:1;">* PR merged without reviews and those merged by the original PR author.</div>
          `;
        }
        if (activity === 'pull-requests/merged') {
          return `<b>${name}</b>
            <div>${value} PRs(${((value / sum[0]) * 100).toFixed(0)}%)</div>`;
        }
        if (activity === 'pull-requests/self-merged') {
          return `<b>${name}</b>
            <div>${value} PRs(${((value / sum[0]) * 100).toFixed(0)}%)</div>`;
        }
        if (activity === 'reviews/reviewed') {
          return `<b>${name}</b>
            <div>${value} PRs(${((value / sum[0]) * 100).toFixed(0)}%)</div>`;
        }
        if (activity === 'issues/closed') {
          return `<b>${name}</b>
            <div>${value} Issues(${((value / sum[0]) * 100).toFixed(
            0
          )}%)</div>`;
        }
        return `${name}: ${value}`;
      },
    },
    grid: simpleGrid(2),
    legend: {
      left: 'center',
      bottom: '0%',
      itemWidth: 5,
      itemHeight: 5,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: handledData,
      },
    ],
  };
}

const styleMap = [
  {
    itemStyle: {
      color: '#5D5BCC',
    },
  },
  {
    itemStyle: {
      color: '#252371',
    },
  },
  {
    itemStyle: {
      color: '#ADACFA',
    },
  },
];

const prStyleRecord = {
  merged: '#5D5BCC',
  open: '#2EC734',
  closed: '#E96373',
}

export const type = 'echarts';
