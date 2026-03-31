import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  recentStatsChartXAxis,
  recentStatsLineSeries,
  simpleGrid,
} from '@/lib/charts-utils/options';

type Params = {
  owner_id: string;
  activity?: 'stars' | 'participants' | 'commits';
};

type StarDataPoint = {
  idx: number;
  current_period_day: string;
  current_period_day_total: number;
  past_period_day: string;
  past_period_day_total: number;
};

type ParticipantDataPoint = StarDataPoint;

type CommitDataPoint = {
  idx: number;
  day: string;
  pushes: number;
  commits: number;
};

type PRReviewDataPoint = StarDataPoint;

type DataPoint =
  | StarDataPoint
  | ParticipantDataPoint
  | CommitDataPoint
  | PRReviewDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

const handleData = (
  data: DataPoint[],
  activity: 'stars' | 'participants' | 'commits' | 'reviews/review-prs'
) => {
  switch (activity) {
    case 'commits':
      const source3 = (data as CommitDataPoint[]).reverse();
      const mainSeries3 = {
        encode: {
          x: 'day',
          y: 'commits',
        },
      };
      const vsSeries3 = {
        encode: {
          x: 'day',
          y: 'pushes',
        },
      };
      return {
        source: source3,
        mainSeries: mainSeries3,
        vsSeries: vsSeries3,
      };
    case 'reviews/review-prs':
      const source4 = [
        ...(data as PRReviewDataPoint[]).sort((a, b) => b.idx - a.idx),
      ];
      const mainSeries4 = {
        encode: {
          x: 'current_period_day',
          y: 'current_period_day_total',
        },
      };
      const vsSeries4 = {
        encode: {
          x: 'current_period_day',
          y: 'past_period_day_total',
        },
      };
      return {
        source: source4,
        mainSeries: mainSeries4,
        // vsSeries: vsSeries4,
      };
    case 'stars':
    default:
      const source1 = [
        ...(data as StarDataPoint[]).sort((a, b) => b.idx - a.idx),
      ];
      const mainSeries1 = {
        encode: {
          x: 'current_period_day',
          y: 'current_period_day_total',
        },
      };
      const vsSeries1 = {
        encode: {
          x: 'current_period_day',
          y: 'past_period_day_total',
        },
      };
      return {
        source: source1,
        mainSeries: mainSeries1,
        vsSeries: vsSeries1,
      };
  }
};

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;
  const { activity = 'stars' } = ctx.parameters;

  const { source, mainSeries, vsSeries } = handleData(main, activity);

  // Server side rendering doesn't support decal
  // Canvas doesn't support full dom api(such as setAttribute) when setting echarts option
  const enableDecal = ctx.runtime === 'client';

  return {
    dataset: {
      source,
    },
    xAxis: {
      type: 'category',
      axisLine: {
        show: false,
      },
      // axisLabel: {
      //   show: false,
      // },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          color: '#2a2a2c', type: 'dashed',
        },
      },
    },
    grid: {
      left: 6,
      top: 20,
      right: 20,
      bottom: 2,
      containLabel: true,
    },
    aria: enableDecal && {
      enabled: true,
      decal: {
        show: true,
      },
    },
    series: [
      {
        type: 'bar',
        name: 'Current period',
        encode: {
          ...mainSeries.encode,
        },
        itemStyle: {
          decal: enableDecal && {
            symbol: 'none',
          },
          borderRadius: [2, 2, 0, 0],
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
      },
      vsSeries && {
        type: 'bar',
        name: 'Last period',
        encode: {
          ...vsSeries.encode,
        },
        itemStyle: {
          color: '#ED5C53',
          opacity: 0.5,
          borderRadius: [2, 2, 0, 0],
          decal: enableDecal && {
            color: 'rgba(0, 0, 0, 0.8)',
            dashArrayX: [1, 0],
            dashArrayY: [2, 5],
            symbolSize: 1,
            rotation: Math.PI / 6,
          },
        },
      },
    ],
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    legend: {
      left: 'center',
    },
  };
}

export const type = 'echarts';
