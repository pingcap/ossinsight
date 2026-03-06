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
import { prettyMs } from '@/lib/widgets-utils/utils';
import { getWidgetSize } from '@/lib/widgets-utils/utils';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type DataPoint = {
  repo_id: number;
  repo_name: string;
  p0: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
};

type MediumDataPoint = {
  current_period_medium: number;
  past_period_medium: number;
  percentage: number;
};

type Input = [DataPoint[], MediumDataPoint[]];

const fmtHours = (hours: number) =>
  prettyMs.default(hours * 60 * 60 * 1000, { unitCount: 1 });

const getTitle = (activity: string) => {
  switch (activity) {
    case 'issues':
      return 'Which Repository Exhibit Exceptional Efficiency in Addressing Issues?';
    case 'pull-requests':
      return 'Which Repository Achieves the Shortest Pull Request Completion Time?';
    default:
      return 'Top Repos of Open to Close Time';
  }
};

export default function (
  [input, mediumInput]: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;

  const activity = ctx.parameters.activity ?? 'pull-requests';

  const mediumData = mediumInput[0];
  const { current_period_medium, percentage } = mediumData;

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title: getTitle(activity),
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      vertical(
        widget('builtin:label-value', undefined, {
          label: fmtHours(current_period_medium),
          value:
            percentage >= 0 ? `↑${(percentage * 100).toFixed(2)}%` : `↓${(percentage * 100).toFixed(2)}%`,
          labelProps: {
            style: {
              fontSize: 24,
              fontWeight: 'bold',
            },
          },
          valueProps: {
            style: {
              fontSize: 12,
              lineHeight: 2,
              color:
                percentage >= 0
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
            },
          },
          column: false,
          tooltip: 'Medium time',
        }).flex(0.2),
        widget(
          '@ossinsight/widget-analyze-org-activity-open-to-close',
          [input],
          ctx.parameters
        )
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
  cols: 6,
  rows: 3,
}
