import type { EChartsVisualizationConfig, WidgetVisualizerContext } from '@/lib/charts-types';

import { simpleGrid } from '@/lib/charts-utils/options';
import { DateTime } from 'luxon';

type Params = {
  start: DateTime
  end: DateTime
  axis_field: string
  value_field: string
  label_field: string
}

export default function (input: any[], ctx: WidgetVisualizerContext<Params>): EChartsVisualizationConfig {
  return {
    series: {
      type: 'scatter',
      color: ctx.theme.colorScheme === 'light' ? '#FFB240' : 'rgb(255, 255, 255)',
      encode: {
        x: ctx.parameters.axis_field,
        y: ctx.parameters.label_field,
        value: ctx.parameters.value_field,
      },
      symbolSize: (val) => Math.min(val.cnt * 5, 28),
    },
    dataset: {
      source: input,
    },
    xAxis: {
      type: 'time',
      min: ctx.parameters.start.toJSDate(),
      max: ctx.parameters.end.toJSDate(),
      axisLabel: {
        show: false,
      },
      name: 'date',
      nameLocation: 'end',
      nameTextStyle: {
        align: 'right',
        verticalAlign: 'bottom',
        fontSize: 12,
        fontStyle: 'italic',
      },
      nameGap: 0,
    },
    yAxis: {
      type: 'category',
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        fontSize: 12,
        color: ctx.theme.colorScheme === 'light' ? 'black' : 'white',
      },
      offset: 16,
    },
    grid: simpleGrid(2, true),
  };
}

export const type = 'echarts';
