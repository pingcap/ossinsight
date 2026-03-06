import type {
  ComposeVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  computeLayout,
  grid as gridUtil,
  nonEmptyDataWidget,
  vertical,
  widget,
} from '@/lib/widgets-utils/compose';
import {
  upperFirst,
  getWidgetSize,
  number2percent,
} from '@/lib/widgets-utils/utils';

type Params = {
  owner_id: string;
  period?: string;
  activity?: string;
};

type TotalDataPoint = {
  current_period_total: number;
  past_period_total: number;
  growth_percentage: number;
};

type RankingDataPoint = {
  login: string;
  engagements: number;
};

type Input = [RankingDataPoint[], TotalDataPoint[]];

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const [contributors, total] = input;
  const sum = contributors.length;

  const totalData: Partial<TotalDataPoint> = total?.[0] ?? {};

  const { rows, cols, size } = {
    rows: 1,
    cols: 5,
    size: 40,
  };
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;

  const growth_percentage =
    (totalData.current_period_total - totalData.past_period_total) /
    totalData.past_period_total;

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title: `${upperFirst(ctx.parameters?.activity)} Participants`,
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      widget('builtin:label-value', undefined, {
        label: totalData?.current_period_total,
        value:
          growth_percentage >= 0
            ? `↑${number2percent(growth_percentage)}`
            : `↓${number2percent(growth_percentage)}`,
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
              growth_percentage >= 0
                ? ctx.theme.colors.green['400']
                : ctx.theme.colors.red['400'],
          },
        },
        column: false,
      }),
      nonEmptyDataWidget(contributors, () =>
        gridUtil(
          rows,
          cols,
          ...contributors.map((item) =>
            widget('builtin:avatar-label', undefined, {
              label: '',
              imgSize: size,
              imgSrc: item.login ? `https://github.com/${item.login}.png` : '',
              href: item.login
                ? `https://ossinsight.io/analyze/${item.login}`
                : '',
            })
          )
        ).gap(4)
      )
    ).padding([0, PADDING, PADDING / 2, PADDING]),
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

export const type = 'compose';

export const grid = {
  cols: 3,
  rows: 2,
};
