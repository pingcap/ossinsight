import type { EChartsVisualizationConfig, WidgetVisualizerContext } from '@ossinsight/widgets-types';

type Params = {
  dimensions: { name: string, max: number }[]
}

type DataPoint = { name: string, value: number[] }

export default function (input: DataPoint, ctx: WidgetVisualizerContext<Params>): EChartsVisualizationConfig {
  const max = Math.max(...input.value);
  const dimensionsNameIndexMap = new Map<string, number>();
  ctx.parameters.dimensions.forEach((d, i) => {
    dimensionsNameIndexMap.set(d.name, i);
  });

  return {
    series: {
      type: 'radar',
      data: [input],
      symbol: 'none',
      color: '#5D5BCC',
      areaStyle: {
        color: '#5D5BCC',
      },
    },
    radar: {
      radius: 92,
      axisName: {
        formatter: (name) => {
          const i = dimensionsNameIndexMap.get(name)!;
          const value = (input.value[i] / ctx.parameters.dimensions[i].max * 100).toFixed(0) + '%';
          return `{name|${name}}\n{value|${value}}`;
        },
        rich: {
          name: {
            color: ctx.theme.colorScheme === 'light' ? 'black' : 'white',
            fontSize: 12,
            opacity: 0.4,
          },
          value: {
            color: ctx.theme.colorScheme === 'light' ? 'black' : 'white',
            lineHeight: 18,
            fontSize: 14,
            align: 'center',
          }
        }
      },
      indicator: ctx.parameters.dimensions.map(d => ({ name: d.name, max })),
      splitNumber: 4,
      axisLine: {
        lineStyle: {
          color: ctx.theme.colorScheme === 'light' ? 'black' : 'white',
          opacity: 0.1,
        },
      },
      splitLine: {
        lineStyle: {
          color: ctx.theme.colorScheme === 'light' ? 'black' : 'white',
          opacity: 0.1,
        },
      },
      splitArea: {
        show: false,
      },
    },
  };
}

export const type = 'echarts';
