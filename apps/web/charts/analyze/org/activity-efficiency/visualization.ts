import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  recentStatsChartXAxis,
  recentStatsLineSeries,
  simpleGrid,
  timeAxis,
} from '@/lib/charts-utils/options';
import { DateTime } from 'luxon';
import { getWidgetSize } from '@/lib/charts-utils/utils';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type PRDataPoint = {
  action_type: 'closed' | 'opened' | 'merged';
  date: string;
  prs: number;
};

type TransformedPRDataPoint = Omit<PRDataPoint, 'action_type'> & {
  action_type: 'closed' | 'open' | 'merged';
};

type IssueDataPoint = {
  action_type: 'closed' | 'opened';
  date: string;
  issues: number;
};

type TransformedIssueDataPoint = Omit<IssueDataPoint, 'action_type'> & {
  action_type: 'closed' | 'open';
};

type DataPoint = PRDataPoint | IssueDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

const handleDataset = (data: DataPoint[], activity: string) => {
  const issueInitData = {
    closed: 0,
    open: 0,
  };
  const prInitData = {
    ...issueInitData,
    merged: 0,
  };
  switch (activity) {
    case 'issues':
      const issueMergedData = (data as IssueDataPoint[]).reduce(
        (acc, cur) => {
          const { date, action_type, issues } = cur;
          const transformedActionType =
            action_type === 'opened' ? 'open' : action_type;
          if (acc.hasOwnProperty(date)) {
            acc[date][transformedActionType] = issues;
          } else {
            acc[date] = {
              date,
              ...issueInitData,
              [transformedActionType]: issues,
            };
          }
          return acc;
        },
        {} as {
          [key: string]: {
            date: string;
            closed?: number;
            open?: number;
            merged?: number;
          };
        }
      );
      return Object.values(issueMergedData);
    case 'pull-requests':
    default:
      const mergedData = (data as PRDataPoint[]).reduce(
        (acc, cur) => {
          const { date, action_type, prs } = cur;
          const transformedActionType =
            action_type === 'opened' ? 'open' : action_type;
          if (acc.hasOwnProperty(date)) {
            acc[date][transformedActionType] = prs;
          } else {
            acc[date] = {
              date,
              ...prInitData,
              [transformedActionType]: prs,
            };
          }
          return acc;
        },
        {} as {
          [key: string]: {
            date: string;
            closed?: number;
            open?: number;
            merged?: number;
          };
        }
      );
      return Object.values(mergedData);
  }
};

const getSeries = (activity: string): any => {
  switch (activity) {
    case 'issues':
      return ['closed', 'open'].map((action_type, idx) => {
        return {
          type: 'line',
          encode: {
            x: 'date',
            y: action_type,
          },
          smooth: true,
          showSymbol: false,
          name: action_type,
        };
      });
    case 'pull-requests':
    default:
      return ['closed', 'open', 'merged'].map((action_type, idx) => {
        return {
          type: 'line',
          encode: {
            x: 'date',
            y: action_type,
          },
          smooth: true,
          showSymbol: false,
          name: action_type,
        };
      });
  }
};

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;
  const { activity = 'pull-requests' } = ctx.parameters ?? {};

  return {
    dataset: {
      id: 'main',
      source: handleDataset(main, activity),
    },
    xAxis: {
      type: 'category',
      show: true,
      axisLabel: {
        formatter: (value: string) => {
          return `${DateTime.fromJSDate(new Date(value)).toFormat(
            'yyyy-MM-dd'
          )}`;
        },
      },
    },
    yAxis: {
      type: 'value',
      show: true,
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
    series: getSeries(activity),
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
      formatter: (params) => {
        const { value = {} } = (params as any[])[0];
        const { date, closed, open, merged } = value;
        const parsedDate = DateTime.fromJSDate(new Date(date)).toFormat(
          'yyyy-MM-dd'
        );
        if (activity === 'issues') {
          return `<b>${parsedDate}</b>
          <div>Closed: ${closed}</div>
          <div>Open: ${open}</div>`;
        }
        return `<b>${parsedDate}</b>
        <div>Closed: ${closed}</div>
        <div>Open: ${open}</div>
        <div>Merged: ${merged}</div>`;
      },
    },
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      top: 0,
      left: 0,
      textStyle: {
        color: ctx.theme.colorScheme === 'light' ? 'black' : 'white',
      },
    },
  };
}

export const type = 'echarts';

export const grid = {
  cols: 9,
  rows: 3,
};
