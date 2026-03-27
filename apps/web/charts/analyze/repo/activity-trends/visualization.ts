import type { EChartsVisualizationConfig, WidgetVisualizerContext } from '@/lib/charts-types';
import { simpleGrid } from '@/lib/charts-utils/options';
import { compare } from '@/lib/charts-utils/visualizer/analyze';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
  from: string;
  to: string;
};

type DataPoint = {
  events: number;
  event_month: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const fmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
});

function fmtDate (val: number) {
  const parts = fmt.formatToParts(val);
  return `${parts[2].value}-${parts[0].value}`;
}

// TODO: This is a copy of the widget from widgets/analyze-repo-stars-history
// TODO: We should update after APIs are updated
export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>,
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const { theme: { colorScheme } } = ctx;

  return {
    dataset: compare(input, (data, name) => ({
      id: name,
      source: data,
    })),
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
        formatter: fmtDate,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
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
    series: compare([main, vs], (data, name) => ({
      datasetId: name,
      type: 'line',
      name: data?.fullName,
      encode: {
        x: 'event_month',
        y: 'events',
      },
      lineStyle: {
        color: '#FF7628',
        width: 1,
      },
      showSymbol: false,
      areaStyle: {
        opacity: 0.8,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: colorScheme === 'light' ? 'rgba(255, 173, 128, 1)' : 'rgba(223, 106, 40, 1)', // color at 0%
            },
            {
              offset: 1,
              color: colorScheme === 'light' ? 'rgba(255, 219, 199, 0)' : 'rgba(102, 70, 51, 0)', // color at 100%
            },
          ],
          global: false, // default is false
        },
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
      itemStyle: {
        color: '#E47C42',
      },
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
      },
      formatter: (name) => `Count all different types of events triggered by activity(pull a request,etc.) on GitHub`,
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
