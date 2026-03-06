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
import { getWidgetSize } from '@/lib/widgets-utils/utils';

type Params = {
  org_id: string;
  activity: string;
};

type PRMergedDataPoint = {
  current_period_percentage: number;
  current_period_prs: number;
  past_period_percentage: number;
  past_period_prs: number;
  percentage_change: number;
  type: 'merged' | 'open' | 'closed';
};

type PRSelfMergedDataPoint = {
  current_period_percentage: number;
  current_period_prs: number;
  past_period_percentage: number;
  past_period_prs: number;
  percentage_change: number;
  type: 'self-merged' | 'others';
};

type IssueClosedDataPoint = {
  current_period_issues: number;
  current_period_percentage: number;
  past_period_issues: number;
  past_period_percentage: number;
  percentage_change: number;
  type: 'un-closed' | 'self-closed' | 'others-closed';
};

type ReviewedDataPoint = {
  type: 'reviewed' | 'un-reviewed';
  current_period_prs: number;
  current_period_percentage: number;
  past_period_prs: number;
  past_period_percentage: number;
  percentage_change: number;
};

type DataPoint =
  | PRMergedDataPoint
  | PRSelfMergedDataPoint
  | IssueClosedDataPoint
  | ReviewedDataPoint;

type Input = [DataPoint[]];

const handleInputData = (data: DataPoint[], activity: string) => {
  switch (activity) {
    case 'issues/closed':
      const { selfClosed, othersClosed, unClosed } = (
        data as IssueClosedDataPoint[]
      ).reduce((acc, cur) => {
        if (cur.type === 'self-closed') {
          acc.selfClosed = { ...cur };
        }
        if (cur.type === 'others-closed') {
          acc.othersClosed = { ...cur };
        }
        if (cur.type === 'un-closed') {
          acc.unClosed = { ...cur };
        }
        return acc;
      }, {} as Record<'selfClosed' | 'othersClosed' | 'unClosed', IssueClosedDataPoint>);
      const issueCurrent =
        selfClosed?.current_period_percentage +
        othersClosed?.current_period_percentage;
      const issueDiff = selfClosed?.percentage_change;
      return {
        title: 'Issue Closed Ratio',
        label: `${(issueCurrent * 100).toFixed(0)}%`,
        value: `${issueDiff >= 0 ? '↑' : '↓'}${Math.abs(
          issueDiff * 100
        ).toFixed(2)}%`,
        isIncrease: issueDiff >= 0,
      };
    case 'reviews/reviewed':
      const { reviewed, unReviewed } = (data as ReviewedDataPoint[]).reduce(
        (acc, cur) => {
          if (cur.type === 'reviewed') {
            acc.reviewed = { ...cur };
          }
          if (cur.type === 'un-reviewed') {
            acc.unReviewed = { ...cur };
          }
          return acc;
        },
        {} as Record<'reviewed' | 'unReviewed', ReviewedDataPoint>
      );
      const reviewCurrent = reviewed?.current_period_percentage;
      const reviewDiff = reviewed?.percentage_change;
      return {
        title: 'Pull Request Reviewed Ratio',
        label: `${(reviewCurrent * 100).toFixed(0)}%`,
        value: `${reviewDiff >= 0 ? '↑' : '↓'}${Math.abs(
          reviewDiff * 100
        ).toFixed(2)}%`,
        isIncrease: reviewDiff >= 0,
      };
    case 'pull-requests/self-merged':
      const { selfMerged, others } = (data as PRSelfMergedDataPoint[]).reduce(
        (acc, cur) => {
          if (cur.type === 'self-merged') {
            acc.selfMerged = { ...cur };
          }
          if (cur.type === 'others') {
            acc.others = { ...cur };
          }
          return acc;
        },
        {} as Record<'selfMerged' | 'others', PRSelfMergedDataPoint>
      );
      const prSelfMergedCurrent = selfMerged?.current_period_percentage;
      const prSelfMergedDiff = selfMerged?.percentage_change;
      return {
        title: 'Self Merge Rates',
        label: `${(prSelfMergedCurrent * 100).toFixed(0)}%`,
        value: `${prSelfMergedDiff >= 0 ? '↑' : '↓'}${Math.abs(
          prSelfMergedDiff * 100
        ).toFixed(2)}%`,
        isIncrease: prSelfMergedDiff >= 0,
      };
    case 'pull-requests/merged':
    default:
      const { merged, closed, open } = (data as PRMergedDataPoint[]).reduce(
        (acc, cur) => {
          if (cur.type === 'merged') {
            acc.merged = { ...cur };
          }
          if (cur.type === 'closed') {
            acc.closed = { ...cur };
          }
          if (cur.type === 'open') {
            acc.open = { ...cur };
          }
          return acc;
        },
        {} as Record<'merged' | 'closed' | 'open', PRMergedDataPoint>
      );
      const prCurrent = merged.current_period_percentage;
      const prDiff = merged.percentage_change;
      return {
        title: 'Pull Request Merged Ratio',
        label: `${(prCurrent * 100).toFixed(0)}%`,
        value: `${prDiff >= 0 ? '↑' : '↓'}${Math.abs(prDiff * 100).toFixed(
          2
        )}%`,
        isIncrease: prDiff >= 0,
      };
  }
};

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

  const data = input[0];
  const activity = ctx.parameters?.activity;

  const { title, label, value, isIncrease } = handleInputData(data, activity);

  return computeLayout(
    vertical(
      widget('builtin:card-heading', undefined, {
        title,
        subtitle: ' ',
      }).fix(HEADER_HEIGHT),
      vertical(
        horizontal(
          widget('builtin:label-value', undefined, {
            label,
            value,
            labelProps: {
              style: {
                fontSize: ctx.runtime === 'server' ? 18 : 24,
                fontWeight: 'bold',
              },
            },
            valueProps: {
              style: {
                fontSize: 12,
                lineHeight: 2,
                color: isIncrease
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
              },
            },
            column: false,
          })
        )
          .gap(SPACING)
          .flex(0.1),
        widget(
          '@ossinsight/widget-analyze-org-activity-action-ratio',
          input,
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
  cols: 3,
  rows: 3,
};
