import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import { compare } from '@/lib/widgets-utils/visualizer/analyze';
import {
  utils,
  categoryAxis,
  heatmap,
  visualMap,
  itemTooltip,
  parseParams2GridOpt,
} from '@/lib/widgets-utils/options';

type Params = {
  repo_id: string;
  period?: string;
  zone?: string;
  vs_repo_id?: string;
};

type DataPoint = {
  dayofweek: number;
  hour: number;
  pushes: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

// lines of code
export type TimeHeatData = {
  dayofweek: number;
  hour: number;
  pushes: number;
};

const hours = [
  '0h',
  '1h',
  '2h',
  '3h',
  '4h',
  '5h',
  '6h',
  '7h',
  '8h',
  '9h',
  '10h',
  '11h',
  '12h',
  '13h',
  '14h',
  '15h',
  '16h',
  '17h',
  '18h',
  '19h',
  '20h',
  '21h',
  '22h',
  '23h',
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

const applyZone = (hour: number | string, zone: number): number => {
  return (Number(hour) + zone + 24) % 24;
};

const prepareData =
  (zone: number) =>
  (data: TimeHeatData[]): TimeHeatData[] => {
    if (data.length === 0) {
      return [];
    }
    const newData = [...data];
    const boolMap: boolean[] = Array(24 * 7).fill(false, 0, 24 * 7);
    for (let i = 0; i < newData.length; i++) {
      const item = (newData[i] = { ...newData[i] });
      item.hour = applyZone(item.hour, zone);
      boolMap[item.dayofweek + item.hour * 7] = true;
    }
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const hour in hours) {
      // eslint-disable-next-line @typescript-eslint/no-for-in-array
      for (const day in days) {
        if (!boolMap[parseInt(day) + applyZone(parseInt(hour), zone) * 7]) {
          newData.push({
            dayofweek: parseInt(day),
            hour: applyZone(parseInt(hour), zone),
            pushes: 0,
          });
        }
      }
    }
    return newData;
  };

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const main = ctx.getRepo(parseInt(ctx.parameters.repo_id));
  const vs = ctx.getRepo(parseInt(ctx.parameters.vs_repo_id));

  const runtime = ctx.runtime;

  const { zone, period } = ctx.getTimeParams();
  const prepareDataWithZone = prepareData(parseInt(zone));

  const dataset = compare(input, (data, name) => ({
    id: name,
    source: prepareDataWithZone(data),
  }));

  const option = {
    dataset,
    grid: parseParams2GridOpt(ctx),
    xAxis: utils.template(
      ({ id }) =>
        categoryAxis<'x'>(id, { gridId: id, data: hours, position: 'top' }),
      !!vs
    ),
    yAxis: utils.template(
      ({ id }) =>
        categoryAxis<'y'>(id, { gridId: id, data: days, inverse: true }),
      !!vs
    ),
    visualMap: visualMap(
      0,
      dataset
        .map((d) => d.source)
        .flat()
        .reduce((p, c) => Math.max(p, c.pushes), 0),
      runtime
    ),
    series: utils.template(
      ({ id }) =>
        heatmap('hour', 'dayofweek', 'pushes', {
          datasetId: id,
          xAxisId: id,
          yAxisId: id,
        }),
      !!vs
    ),
    tooltip: itemTooltip({
      renderMode: 'html',
      formatter: (params) => {
        const value = params.value as TimeHeatData;
        return `<b>${days[value.dayofweek]}</b> <b>${hours[value.hour]}</b>: ${
          value.pushes
        } pushes`;
      },
    }),
    legend: {
      show: true,
    },
  };

  return option;
}

export const type = 'echarts';
