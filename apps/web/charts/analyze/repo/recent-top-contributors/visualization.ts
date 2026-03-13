import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { axisTooltip, simpleGrid } from '@/lib/charts-utils/options';
import { compare } from '@/lib/charts-utils/visualizer/analyze';

type Params = {
  repo_id: string;
};

type DataPoint = {
  actor_login: string;
  events: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export default function (
  data: Input,
  ctx: WidgetVisualizerContext<Params>
): EChartsVisualizationConfig {
  const [main, vs] = data;

  return {
    dataset: compare(data, (data, name) => ({
      id: name,
      source: data.sort((a, b) => a.events - b.events),
    })),
    grid: simpleGrid(0),
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      show: false,
    },
    series: [
      {
        type: 'bar',
        name: 'Contributions',
        barCategoryGap: 0,
        barWidth: 10,
        itemStyle: {
          borderRadius: 10,
        },
        encode: {
          x: 'events',
          y: 'actor_login',
        },
        color: {
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            {
              offset: 0.25,
              color: '#DE631E',
            },
            {
              offset: 1,
              color: '#FFB186',
            },
          ],
        },
      },
    ],
    legend: {
      right: 0,
      bottom: 0,
      icon: 'circle',
      selector: false,
      padding: 6,
      itemWidth: 8,
      itemHeight: 8,
      selectedMode: false,
    },
    tooltip: axisTooltip('none'),
  };
}

export const type = 'echarts';
