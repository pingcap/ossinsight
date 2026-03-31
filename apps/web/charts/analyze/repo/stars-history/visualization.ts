import type { EChartsVisualizationConfig, WidgetVisualizerContext } from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';

type Params = {
  repo_id: string
  vs_repo_id?: string
}

type DataPoint = {
  count: number
  event_month: string
  total: number
}

type Input = [DataPoint[], (DataPoint[]) | undefined]

const MAIN_COLOR = '#FFE895';
const VS_COLOR = '#56AEFF';

export default function (input: Input, ctx: WidgetVisualizerContext<Params>): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));
  const hasVs = !!vs;

  return {
    color: hasVs ? [MAIN_COLOR, VS_COLOR] : [MAIN_COLOR],
    dataset: compare(input, (data, name) => ({
      id: name,
      source: data,
    })),
    grid: {
      top: hasVs ? 36 : 16,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: '#2a2a2c', type: 'dashed' } },
      axisLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
        formatter: format,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#2a2a2c',
          type: 'dashed',
        },
      },
    },
    series: compare([main, vs], (data, name) => ({
      datasetId: name,
      type: 'line',
      name: data?.fullName,
      encode: {
        x: 'event_month',
        y: 'total',
      },
      showSymbol: false,
      lineStyle: { width: 1.5 },
      emphasis: {
        lineStyle: { width: 2 },
      },
    })),
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: '#242331',
      borderColor: 'rgba(255,255,255,0.08)',
      textStyle: {
        color: '#ccc',
        fontSize: 12,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(255,255,255,0.12)',
        },
      },
    },
    legend: {
      show: hasVs,
      top: 0,
      textStyle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
      },
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 2,
      itemGap: 20,
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
