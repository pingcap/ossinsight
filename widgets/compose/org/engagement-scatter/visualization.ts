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
  hideData?: boolean;
  owner_id: string;
  activity?: string;
};

type DataPoint = {
  repos: number;
  engagements: number;
  participants: number;
  participant_logins: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

const calcMinMax = (data: DataPoint[]) => {
  let repoMin = Infinity;
  let repoMax = -Infinity;
  let engagementsMin = Infinity;
  let engagementsMax = -Infinity;
  for (const d of data) {
    if (d.repos < repoMin) {
      repoMin = d.repos;
    }
    if (d.repos > repoMax) {
      repoMax = d.repos;
    }
    if (d.engagements < engagementsMin) {
      engagementsMin = d.engagements;
    }
    if (d.engagements > engagementsMax) {
      engagementsMax = d.engagements;
    }
  }
  return [repoMin, repoMax, engagementsMin, engagementsMax];
};

const generateMatrix = (
  data: DataPoint[],
  option: {
    xMax: number;
    yMax: number;
    xIntervals: number;
    yIntervals: number;
  }
): (DataPoint | undefined)[][][] => {
  const { xMax, yMax, xIntervals, yIntervals } = option;
  const matrix = new Array(xIntervals)
    .fill(undefined)
    .map(() => new Array(yIntervals).fill(undefined));
  const xStep = Math.ceil(xMax / xIntervals);
  const yStep = Math.ceil(yMax / yIntervals);
  for (const d of data) {
    const x = Math.floor(d.engagements / xStep);
    const y = Math.floor(d.repos / yStep);
    try {
      matrix[x][y] = [...(matrix[x][y] ?? []), d];
    } catch (error) {}
  }
  return matrix;
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

  const [repoMin, repoMax, engagementsMin, engagementsMax] = calcMinMax(
    input[0]
  );

  const matrix = generateMatrix(input[0], {
    xMax: engagementsMax,
    yMax: repoMax,
    xIntervals: 20,
    yIntervals: 10,
  });

  const innerWidget =
    ctx.runtime === 'client'
      ? [
          widget(
            '@ossinsight/widget-analyze-org-engagement-scatter',
            input,
            ctx.parameters
          ),
        ]
      : [
          horizontal(
            ...matrix.map((col) => {
              return vertical(
                ...col.reverse().map((item) => {
                  if (!item) {
                    return widget('builtin:label-value', undefined, {
                      label: '',
                    });
                  }
                  const renderItem = item.pop();
                  return widget('builtin:avatar-label', undefined, {
                    label: '',
                    imgSize: 20,
                    imgSrc: renderItem?.participant_logins
                      ? `https://github.com/${
                          renderItem.participant_logins.split(',')[0]
                        }.png`
                      : '',
                  });
                })
              );
            })
          ).padding([0, PADDING * 3, 0, PADDING]),
        ];

  ctx.runtime === 'server' && (ctx.parameters.hideData = true);

  return [
    ...(ctx.runtime === 'server'
      ? computeLayout(
          vertical(
            widget('builtin:label-value', undefined, {
              label: '',
            }).fix(HEADER_HEIGHT),
            widget(
              '@ossinsight/widget-analyze-org-engagement-scatter',
              input,
              ctx.parameters
            )
          ).padding([0, PADDING, PADDING]),
          0,
          0,
          WIDTH,
          HEIGHT
        )
      : []),
    ...computeLayout(
      vertical(
        widget('builtin:card-heading', undefined, {
          title: `Who's the Most Engaged in This GitHub Organization?`,
          subtitle: ' ',
        }).fix(HEADER_HEIGHT),
        ...innerWidget
      ).padding([0, PADDING, PADDING, PADDING]),
      0,
      0,
      WIDTH,
      HEIGHT
    ),
  ];
}

export const type = 'compose';

export const grid = {
  cols: 5,
  rows: 5,
}
