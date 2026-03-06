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

type StarDataPoint = {
  country_code: string;
  stars: number;
};

type ParticipantDataPoint = {
  country_code: string;
  participants: number;
};

type DataPoint = StarDataPoint | ParticipantDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

export type LocationData = {
  country_or_area: string;
  count: number;
};

const getTitle = (activity: string) => {
  switch (activity) {
    case 'stars':
      return 'Where Are Those Stargazers Located?';
    case 'participants':
      return 'Where Are Our GitHub Participants Based?';
    default:
      return 'Geographical Distribution';
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
      widget(
        '@ossinsight/widget-analyze-org-activity-map',
        input,
        ctx.parameters
      )
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
