import type {
  ComposeVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  autoSize,
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
  repo_id: number;
  repo_name: string;
  stars: number;
};

type TotalDataPoint = {
  current_period_total: number;
  past_period_total: number;
  growth_percentage: number;
};

type DataPoint = StarDataPoint;

type Input = [DataPoint[], TotalDataPoint[]];

const handleInputData = (data: DataPoint[], activity: string) => {
  switch (activity) {
    case 'stars':
    default:
      return {
        data: data.slice(0, 5),
        title: 'Top Repos',
        subtitle: ' ',
        label: 'Repo',
        value: 'Star earned',
        maxVal: data.reduce((acc, cur) => acc + cur.stars, 0),
      };
  }
};

export default function (
  [inputData]: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const { activity = 'activities' } = ctx.parameters;

  const { title, subtitle, label, value, data, maxVal } = handleInputData(
    inputData,
    activity
  );

  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title,
        subtitle,
      }).fix(HEADER_HEIGHT),
      widget('builtin:label-value', undefined, {
        label,
        value,
        labelProps: {
          style: {
            fontSize: 12,
            fontWeight: 'normal',
          },
        },
        valueProps: {
          style: {
            fontSize: 12,
            fontWeight: 'normal',
            // color: ctx.theme.colors.green['400'],
            marginLeft: 'auto',
          },
        },
        column: false,
      }).flex(0.1),
      nonEmptyDataWidget(data, () =>
        horizontal(
          vertical(
            ...data.map((item) =>
              widget('builtin:avatar-progress', undefined, {
                label: item.repo_name.split('/')[1],
                imgSrc: `https://github.com/${
                  item.repo_name.split('/')[0]
                }.png`,
                size: 24,
                value: item?.stars,
                maxVal,
                href: `https://ossinsight.io/analyze/${item.repo_name}`,
              })
            )
          ).flex(1)
          // widget('@ossinsight/widget-analyze-repo-recent-top-contributors', [sortedContributors], ctx.parameters),
        )
      )
    ).padding([
      0,
      PADDING,
      PADDING -
        autoSize(ctx, 4) /* the bar chart have small padding vertically */,
    ]),
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

export const type = 'compose';

export const grid = {
  cols: 5,
  rows: 4,
};
