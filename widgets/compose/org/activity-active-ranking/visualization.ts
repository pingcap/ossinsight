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
import {
  getWidgetSize,
  number2percent,
} from '@/lib/widgets-utils/utils';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type ParticipantDataPoint = {
  login: string;
  engagements: number;
};

type ActivityDataPoint = {
  repo_id: number;
  repo_name: string;
  activities: number;
};

type TotalDataPoint = {
  current_period_total: number;
  past_period_total: number;
  growth_percentage: number;
};

type DataPoint = ParticipantDataPoint | ActivityDataPoint;

type Input = [DataPoint[], TotalDataPoint[]];

const handleInputData = (data: DataPoint[], activity: string) => {
  switch (activity) {
    case 'repos':
      return {
        data: (data as ActivityDataPoint[])
          .sort((a, b) => b.activities - a.activities)
          .slice(0, 5),
        title: 'Active Repositories',
        subtitle: ' ',
        label: 'Top Repositories',
        value: 'Activities',
        maxVal: (data as ActivityDataPoint[]).reduce(
          (acc, cur) => acc + cur.activities,
          0
        ),
      };
    case 'participants':
    default:
      return {
        data: (data as ParticipantDataPoint[]).slice(0, 5),
        title: 'Top Participants',
        subtitle: ' ',
        label: 'Name',
        value: 'Activity Count',
        maxVal: (data as ParticipantDataPoint[]).reduce(
          (acc, cur) => acc + cur.engagements,
          0
        ),
      };
  }
};

const getLogin = (item: DataPoint) => {
  if (item.hasOwnProperty('login')) {
    return (item as ParticipantDataPoint).login;
  }
  return (item as ActivityDataPoint).repo_name.split('/')[0];
};

const getLabel = (item: DataPoint) => {
  if (item.hasOwnProperty('login')) {
    return (item as ParticipantDataPoint).login;
  }
  return (item as ActivityDataPoint).repo_name.split('/').pop();
};

const getHref = (item: DataPoint, activity?: string) => {
  if (activity === 'participants') {
    return `https://ossinsight.io/analyze/${(item as ParticipantDataPoint).login}`;
  }
  if (activity === 'repos') {
    return `https://ossinsight.io/analyze/${(item as ActivityDataPoint).repo_name}`;
  }
  return undefined;
}

const handleTotal = (total: TotalDataPoint[] | undefined) => {
  if (!total) {
    return null;
  }
  const { current_period_total, past_period_total } = total?.[0] || {};

  const currentSum = current_period_total;
  const pastSum = past_period_total;
  const diff = currentSum - pastSum;
  const diffPercentage = number2percent(diff / pastSum);
  return {
    current_period_total,
    past_period_total,
    diff,
    diffPercentage,
  };
};

const getToolTipContent = (activity: string) => {
  switch (activity) {
    case 'repos':
      return 'Total count of all repository activity events, including open/merge/close pull requests, and open/close issues, etc.';
    case 'participants':
    default:
      return '';
  }
};

export default function (
  [inputData, totalData]: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const { activity = 'repos' } = ctx.parameters;

  // const total = handleTotal(totalData);

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
          tooltip: getToolTipContent(activity),
        },
        column: false,
      }).flex(0.1),
      nonEmptyDataWidget(data, () =>
        horizontal(
          vertical(
            ...data.map((item) =>
              widget('builtin:avatar-progress', undefined, {
                label: getLabel(item),
                imgSrc: `https://github.com/${getLogin(item)}.png`,
                size: 24,
                value: item?.activities || item?.engagements,
                maxVal,
                href: getHref(item, activity),
              })
            )
          ).flex(0.9)
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
  cols: 3,
  rows: 4,
};
