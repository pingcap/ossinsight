import type {
  ComposeVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import {
  autoSize,
  computeLayout,
  horizontal,
  vertical,
  widget,
} from '@/lib/widgets-utils/compose';
import {
  getWidgetSize,
  number2percent,
} from '@/lib/widgets-utils/utils';

type Params = {
  owner_id: string;
};

type DataPoint = {
  idx: number;
  current_period_day: string;
  current_period_day_total: number;
  past_period_day: string;
  past_period_day_total: number;
};

type TotalDataPoint = {
  current_period_total: number;
  growth_percentage: number;
  past_period_total: number;
};

type Input = [DataPoint[], TotalDataPoint[]];

export default function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const WIDTH = ctx.width;
  const HEIGHT = ctx.height;
  const SPACING = 16;
  const PADDING = 24;
  const HEADER_HEIGHT = 48;
  const HORIZONTAL_SPACING = 64;

  const [data, total] = input;

  const { current_period_total, past_period_total } = total?.[0] ?? {};

  const currentStarsSum = current_period_total;
  const pastStarsSum = past_period_total;
  const diff = currentStarsSum - pastStarsSum;
  const diffPercentage = number2percent(diff / pastStarsSum);

  const stars = transferData2Star(data);

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title: 'Star Earned',
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      horizontal(
        horizontal(
          widget('builtin:label-value', undefined, {
            label: currentStarsSum,
            value: diff >= 0 ? `↑${diffPercentage}` : `↓${diffPercentage}`,
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
                  diff >= 0
                    ? ctx.theme.colors.green['400']
                    : ctx.theme.colors.red['400'],
              },
            },
            column: false,
          }).flex()
        )
          .gap(SPACING)
          .flex(0.3),
        widget(
          '@ossinsight/widget-analyze-repo-recent-stars',
          [stars],
          { ...ctx.parameters, options: { unit: 'Star(s)' } }
        ).flex(0.3)
      )
    )
      .padding([0, PADDING, PADDING])
      .gap(SPACING),
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

const transferData2Star = (data: DataPoint[]) => {
  return data.map((d) => {
    return {
      idx: d.idx,
      current_period_day: d.current_period_day,
      current_period_day_stars: d.current_period_day_total,
      current_period_stars: d.current_period_day_total,
      last_period_day: d.past_period_day,
      last_period_day_stars: d.past_period_day_total,
      last_period_stars: d.past_period_day_total,
    };
  });
};

export const type = 'compose';

export const grid = {
  cols: 6,
  rows: 2,
};
