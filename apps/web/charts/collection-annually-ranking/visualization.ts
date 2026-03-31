import type { EChartsVisualizationConfig, WidgetVisualizerContext } from '@/lib/charts-types';
import { activityDisplayName } from '@/utils/options/activity';

type Params = { activity: string, collection_id: string }
type Input = { event_year: number, rank: number, repo_id: number, repo_name: string, total: number }[]

export default function (input: Input, ctx: WidgetVisualizerContext<Params>): EChartsVisualizationConfig {
  let repos = getAllRepos(input);
  const collection = ctx.getCollection(Number(ctx.parameters.collection_id));
  const isSuperSmallImage = false;

  return {
    grid: {
      containLabel: true,
      top: 0,
      bottom: 12,
      left: 0,
      right: 108,
    },
    yAxis: {
      type: 'value',
      interval: 1,
      min: 1,
      inverse: true,
      splitLine: { show: !isSuperSmallImage },
      axisLabel: { show: !isSuperSmallImage },
      axisPointer: { show: true, type: 'shadow', snap: true, label: { show: true, precision: 0 }, triggerTooltip: false },
    },
    xAxis: {
      type: 'time',
      axisLabel: { formatter: (p: string | number) => String(p), showMaxLabel: true, show: !isSuperSmallImage },
      minInterval: 1,
      position: 'top',
      splitLine: { show: !isSuperSmallImage },
      offset: 28,
      axisLine: { show: false },
      axisTick: { show: false },
      axisPointer: { show: true, type: 'line', snap: true, label: { formatter: ({ value }) => String(value) }, triggerTooltip: false },
    },
    tooltip: {
      trigger: 'item',
    },
    dataset: [
      { id: 'original', source: input },
      ...repos.map(repo => ({
        id: repo,
        fromDatasetId: 'original',
        transform: [
          { type: 'filter', config: { value: repo, dimension: 'repo_name' } },
          { type: 'sort', config: { dimension: 'event_year', order: 'asc' } },
        ],
      })),
    ],
    series: repos.map((repo, index) => ({
      type: 'line',
      id: repo,
      name: repo,
      datasetId: repo,
      encode: { x: 'event_year', y: 'rank' },
      smooth: !isSuperSmallImage,
      lineStyle: {
        width: isSuperSmallImage ? (index < 5 ? 3 : 0) : 3,
        cap: 'round',
        join: 'round'
      },
      symbolSize: isSuperSmallImage ? 0 : 8,
      symbol: 'circle',
      endLabel: {
        show: isSuperSmallImage ? (index < 5) : true,
        offset: [12, 0],
        width: 96,
        fontSize: 14,
        overflow: 'truncate',
        formatter: (param) => {
          const fullName = param.seriesName as string;
          const [owner, name] = fullName.split('/');
          if (owner === name) {
            return name;
          } else {
            return `{owner|${owner}/}\n${name}`;
          }
        },
        rich: {
          owner: {
            fontSize: 12,
            color: 'gray',
          },
        },
      },
      emphasis: { focus: 'series', label: { fontSize: 10 } },
      tooltip: {
        formatter: '{a}',
      },
    })),
  };
}

export const type = 'echarts';

function getAllRepos (input: Input) {
  const maxYear = input.reduce((max, i) => Math.max(max, i.event_year), 0);
  return input.filter(i => i.event_year === maxYear).sort((a, b) => a.rank - b.rank).map(i => i.repo_name);
}

export function computeDynamicHeight (input: Input) {
  const all = getAllRepos(input).length;
  return all * 36;
}
