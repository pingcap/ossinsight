import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { compare } from '@/lib/charts-utils/visualizer/analyze';
import {
  parseParams2GridOpt,
  utils,
  timeAxis,
  valueAxis,
  axisTooltip,
  formatMonth,
  bar as barSeries,
  line as lineSeries,
  dataZoom,
  parseParams2DataZoomOpt,
} from '@/lib/charts-utils/options';
import type { DataZoomOptType } from '@/lib/charts-utils/options';

type Params = {
  repo_id: string;
  vs_repo_id?: string;
} & DataZoomOptType;

type DataPoint = {
  additions: number;
  changes: number;
  deletions: number;
  net_additions: number;
  event_month: string;
};

type TransformedDataPoint = {
  additions: number;
  deletions: number;
  total: number;
  event_month: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

function transformLocData(data: DataPoint[]) {
  let total = 0;
  return (
    data.map((item) => ({
      event_month: item.event_month,
      additions: item.additions,
      deletions: -item.deletions,
      total: (total = total + item.additions - item.deletions),
    })) ?? []
  );
}

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id ?? ''));

  const dataset = compare(input, (data, name) => ({
    id: name,
    source: transformLocData(data),
  }));

  const calcMinMax = (data: TransformedDataPoint[]) => {
    const result: any[] = [];

    const adjusted = utils.adjustAxis(data, [
      ['additions', 'deletions'],
      ['total'],
    ]);

    for (let i = 0; i < 2; i++) {
      result[i] = {
        max: Math.max(adjusted[i].max, Number.MIN_VALUE),
        min: Math.min(adjusted[i].min, Number.MAX_VALUE),
      };
    }

    return result;
  };

  const defaultCompareInput: [any, any] = [
    main && {
      id: 'main',
    },
    vs && {
      id: 'vs',
    },
  ];

  return {
    dataset,
    grid: parseParams2GridOpt(ctx),
    xAxis: utils.template(
      ({ id }) => timeAxis<'x'>(id, { gridId: id }, undefined, input),
      !!vs
    ),
    yAxis: utils.template(
      ({ id }) => [
        valueAxis<'y'>(`${id}-diff`, {
          gridId: id,
          position: 'left',
          name: 'Diff / lines',
          ...(dataset.find((x) => x.id === id) &&
            calcMinMax(dataset.find((x) => x.id === id)!.source)[0]),
        }),
        valueAxis<'y'>(`${id}-total`, {
          gridId: id,
          position: 'right',
          name: 'Total / lines',
          ...(dataset.find((x) => x.id === id) &&
            calcMinMax(dataset.find((x) => x.id === id)!.source)[1]),
        }),
      ],
      !!vs
    ),
    series: compare([main, vs], (data, name) => [
      barSeries('event_month', 'additions', {
        datasetId: name,
        stack: `stack-${name}`,
        color: '#57ab5a',
        xAxisId: name,
        yAxisId: `${name}-diff`,
        barMaxWidth: 8,
      }),
      barSeries('event_month', 'deletions', {
        datasetId: name,
        stack: `stack-${name}`,
        color: '#e5534b',
        xAxisId: name,
        yAxisId: `${name}-diff`,
        barMaxWidth: 8,
      }),
      lineSeries('event_month', 'total', {
        datasetId: name,
        showSymbol: false,
        color: '#cc6b2c',
        xAxisId: name,
        yAxisId: `${name}-total`,
      }),
    ]).flatMap((x) => [x[0], x[1], x[2]] as const),
    dataZoom: dataZoom(parseParams2DataZoomOpt(ctx.parameters), !!vs, ctx.runtime),
    tooltip: axisTooltip('cross', {
      formatter: (params) => {
        const [add, del, total] = params as any[];
        return `
        <div>${formatMonth(add.value.event_month)}</div>
        <div>
          <b style="color: ${add.color as string}; font-weight: 800">+${
          add.value.additions as number
        }</b>
          <b style="color: ${
            del.color as string
          }; font-weight: 800">-${Math.abs(del.value.deletions)}</b>
        </div>
        <div>
          ${total.marker as string}
          <b>Total: ${total.value.total as string} lines</b>
        </div>
      `;
      },
    }),
    legend: {
      show: true,
    },
  };
}

export const type = 'echarts';
