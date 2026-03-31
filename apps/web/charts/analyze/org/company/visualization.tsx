import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { renderWordCloud } from '@/charts/shared/word-cloud';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type ParticipantDataPoint = {
  organization_name: string;
  participants: number;
};

type StarDataPoint = {
  organization_name: string;
  stars: number;
};

type DataPoint = ParticipantDataPoint | StarDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

const ORG_COLORS = ['#dd6b66', '#759aa0'];

export default async function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>,
  signal?: AbortSignal,
) {
  return renderWordCloud(input, ctx, {
    getText: (item: DataPoint) => item.organization_name,
    getValueIndex: (ctx) => ctx.parameters?.activity || 'participants',
    getColor: (i) => ORG_COLORS[i],
    sortComparator: (a, b) => b.size - a.size,
  }, signal);
}

export const type = 'react-svg';
export const asyncComponent = true;
