import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { simpleGrid } from '@/lib/charts-utils/options';
import { compare } from '@/lib/charts-utils/visualizer/analyze';

type Params = {
  user_id: string;
  vs_user_id?: string;
};

type ContributionType =
  | 'issues'
  | 'issue_comments'
  | 'pull_requests'
  | 'reviews'
  | 'review_comments'
  | 'pushes';

export const contributionTypes: ContributionType[] = [
  'issues',
  'pull_requests',
  'reviews',
  'pushes',
  'review_comments',
  'issue_comments',
];

type DataPoint = {
  contribution_type: ContributionType;
  event_month: string;
  cnt: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const chartColors = [
  '#34A352',
  '#D34764',
  '#FF9D36',
  '#FDE494',
  '#2F92FF',
  '#BCDAFF',
];

const generateDataset = (data: DataPoint[]) => {
  const initialDataset: Record<ContributionType, DataPoint[]> = {} as Record<ContributionType, DataPoint[]>;
  contributionTypes.forEach((type) => {
    initialDataset[type] = [];
  });
  const collection = data.reduce((acc, cur) => {
    acc[cur.contribution_type].push(cur);
    return acc;
  }, initialDataset as Record<ContributionType, DataPoint[]>);
  return (Object.keys(collection) as ContributionType[]).map((key) => ({
    id: key,
    source: collection[key],
  }));
};

const getMaxValue = (data: DataPoint[]) => {
  return Math.max(...data.map((d) => d.cnt));
};

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const {
    theme: { colorScheme },
  } = ctx;

  return {
    dataset: generateDataset(input[0] || []),
    grid: { ...simpleGrid(0, true), top: 48, left: 8, right: 8 },
    xAxis: {
      type: 'time',
      splitNumber: 4,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: 10,
        color: '#777',
        hideOverlap: true,
        showMinLabel: false,
        showMaxLabel: false,
        verticalAlign: 'middle',
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      max: getMaxValue(input[0] || []),
      splitNumber: 2,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: 10,
        color: '#777',
        hideOverlap: true,
        verticalAlign: 'middle',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
        interval: 'auto',
      },
    },
    series: contributionTypes.map((type, idx) => ({
      datasetId: type,
      type: 'line',
      name: type,
      encode: {
        x: 'event_month',
        y: 'cnt',
      },
      color: chartColors[idx % chartColors.length],
      symbolSize: 0,
      lineStyle: {
        width: 1,
      },
      areaStyle: {
        opacity: 0.15,
      },
    })),
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    legend: {
      show: true,
      top: 0,
      left: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
      },
      type: ctx.runtime === 'server' ? 'plain' : 'scroll',
    },
  };
}

export const type = 'echarts';
