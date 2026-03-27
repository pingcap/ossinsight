import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import {
  logAxis,
  axisTooltip,
  simpleGrid,
} from '@/lib/charts-utils/options';
import { prettyMs } from '@/lib/charts-utils/utils';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type DataPoint = {
  repo_id: number;
  repo_name: string;
  p0: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const fmtHours = (hours: number) =>
  prettyMs.default(hours * 60 * 60 * 1000, { unitCount: 1 });

function getMax(data: DataPoint[]): number {
  return data.reduce((prev, current) => Math.max(prev, current.p100), 0) ?? 0;
}

function getMin(data: DataPoint[]): number {
  return (
    data.reduce(
      (prev, current) => Math.min(prev, current.p0 > 0 ? current.p0 : prev),
      Number.MAX_SAFE_INTEGER
    ) ?? Number.MAX_SAFE_INTEGER
  );
}

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main] = input;
  const slicedMain = main.slice(0, 5).reverse();

  const reducedInput = input.reduce((prev, current) => {
    if (current) {
      prev.push(current);
    }
    return prev;
  }, [] as DataPoint[][]);

  const calcMax = (data: DataPoint[][]) => {
    if (data.length <= 1) {
      return getMax(data[0]);
    }
    return Math.max(...data.map((val) => getMax(val)));
  };
  const calcMin = (data: DataPoint[][]) => {
    if (data.length <= 1) {
      return getMin(data[0]);
    }
    return Math.min(...data.map((val) => getMin(val)));
  };

  const max = calcMax(reducedInput);
  const min = calcMin(reducedInput);

  return {
    dataset: [
      {
        id: 'main',
        source: slicedMain,
      },
    ],
    grid: {
      ...simpleGrid(2, true),
      id: 'main',
    },
    xAxis: logAxis<'x'>('main', {
      name: 'Duration',
      gridId: 'main',
      axisLabel: { formatter: fmtHours },
      axisPointer: {
        label: {
          formatter: ({ value }: { value: any }) => fmtHours(Number(value)),
        },
      },
      max,
      min,
    }),
    yAxis: {
      type: 'category',
      name: 'Repo',
      axisLabel: {
        formatter: (value: string) => value.split('/')[1],
      },
      triggerEvent: true,
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.08)',
          type: 'dashed',
        },
      },
    },
    tooltip: axisTooltip('cross', {
      renderMode: 'html',
      formatter: (params) => {
        const { value, marker } = (params as any[])[0];
        return `
        ${marker as string}
        <span>${value.repo_name}</span>
        <br/>
        <b>min</b>: ${fmtHours(value.p0)}
        <br/>
        <b>p25</b>: ${fmtHours(value.p25)}
        <br/>
        <b>medium</b>: ${fmtHours(value.p50)}
        <br/>
        <b>p75</b>: ${fmtHours(value.p75)}
        <br/>
        <b>max</b>: ${fmtHours(value.p100)}
      `;
      },
    }),
    series: [
      {
        datasetId: 'main',
        type: 'boxplot',
        encode: {
          x: ['p0', 'p25', 'p50', 'p75', 'p100'],
          y: 'repo_name',
          tooltip: 'repo_name',
        },
        itemStyle: {
          color: 'rgba(221, 107, 102, 0.3)',
          borderWidth: 1,
        },
        boxWidth: ['40%', '40%'],
      },
    ],
  };
}

export const eventHandlers = [
  {
    type: 'click',
    option: 'yAxis.category',
    handler: (params) => {
      if (params?.value) {
        window.open(`/analyze/${params.value}`);
      }
    },
  },
];

export const type = 'echarts';
