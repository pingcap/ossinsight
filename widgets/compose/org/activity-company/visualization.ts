import type {
  ComposeVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  computeLayout,
  horizontal,
  nonEmptyDataWidget,
  vertical,
  widget,
} from '@/lib/widgets-utils/compose';
import { getWidgetSize } from '@/lib/widgets-utils/utils';

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

const getTitle = (activity: string) => {
  switch (activity) {
    case 'stars':
      return 'Which Companies Do Those Stargazers Belong To?';
    case 'participants':
      return 'Which Companies Are Represented Among Our GitHub Participants';
    default:
      return 'Company Affiliations';
  }
};

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;

  const activity = ctx.parameters.activity ?? 'stars';

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title: getTitle(activity),
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      widget('@ossinsight/widget-analyze-org-company', input, ctx.parameters)
    ).padding([0, PADDING, PADDING]),
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

export const type = 'compose';

export const grid = {
  cols: 7,
  rows: 4,
}
