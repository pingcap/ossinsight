import type { EChartsVisualizationConfig, WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { compare } from '@/lib/widgets-utils/visualizer/analyze';

type Params = {
  repo_id: string
  vs_repo_id?: string
}

type DataPoint = {
  count: number
  event_month: string
}

type Input = [DataPoint[], (DataPoint[]) | undefined]

export default function (input: Input, ctx: WidgetVisualizerContext<Params>): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id));

  return {
    dataset: compare(input, (data, name) => ({
      id: name,
      source: data,
    })),
    grid: {
      top: 32,
      bottom: 16,
      left: 8,
      right: 16,
      containLabel: true,
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: format,
      },
    },
    series: compare([main, vs], (data, name) => ({
      datasetId: name,
      type: 'line',
      name: data.fullName,
      encode: {
        x: 'event_month',
        y: 'total',
      },
      lineStyle: {},
      showSymbol: false,
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
    },
  };
}

const units = ['', 'k', 'm', 'b'];

function format (value: number) {
  if (value === 0) {
    return '0';
  }
  let i = 0;
  while (value % 1000 === 0 && i < units.length) {
    value = value / 1000;
    i++;
  }

  return `${value}${units[i]}`;
}

export const type = 'echarts';
