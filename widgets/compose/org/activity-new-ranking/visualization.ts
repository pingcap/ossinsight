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

const getHref = (item: DataPoint, activity?: string) => {
  if (activity === 'participants') {
    return `https://ossinsight.io/analyze/${(item as ParticipantDataPoint).login}`;
  }
  return undefined;
}

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
        value: 'Star earned',
        maxVal: (data as ActivityDataPoint[]).reduce(
          (acc, cur) => acc + cur.activities,
          0
        ),
      };
    case 'stars':
      return {
        data: (data as ActivityDataPoint[])
          .sort((a, b) => b.activities - a.activities)
          .slice(0, 5),
        title: 'Top Repositories by Stars',
        subtitle: ' ',
        label: 'Repositories',
        value: 'Star earned',
        maxVal: (data as ActivityDataPoint[]).reduce(
          (acc, cur) => acc + cur.activities,
          0
        ),
      };
    case 'participants':
    default:
      return {
        data: (data as ParticipantDataPoint[]).slice(0, 5),
        title: 'Top New Participants',
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

export default function (
  [inputData]: Input,
  ctx: WidgetVisualizerContext<Params>
): ComposeVisualizationConfig {
  const { activity = 'participants' } = ctx.parameters;

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
      horizontal(
        widget('builtin:label-value', undefined, {
          label,
          value: '',
        }).flex(0.5),
        widget('builtin:label-value', undefined, {
          label: value,
          value: '',
          labelProps: {
            marginLeft: 'auto',
          },
        }).flex(0.3)
      ).flex(0.1),
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
