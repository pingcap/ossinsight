import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as actionRatioViz from '@/charts/analyze/org/activity-action-ratio/visualization';

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

const defaultResult = { title: 'N/A', label: '0%', value: '0%', isIncrease: false };

const formatPercentage = (val: number | undefined) => `${((val ?? 0) * 100).toFixed(0)}%`;
const formatDiff = (diff: number | undefined) => {
  const d = diff ?? 0;
  return `${d >= 0 ? '↑' : '↓'}${Math.abs(d * 100).toFixed(2)}%`;
};

const handleInputData = (data: DataPoint[], activity: string) => {
  if (!data?.length) return defaultResult;

  switch (activity) {
    case 'issues/closed': {
      const { selfClosed, othersClosed } = (
        data as IssueClosedDataPoint[]
      ).reduce((acc, cur) => {
        if (cur.type === 'self-closed') acc.selfClosed = { ...cur };
        if (cur.type === 'others-closed') acc.othersClosed = { ...cur };
        if (cur.type === 'un-closed') acc.unClosed = { ...cur };
        return acc;
      }, {} as Record<'selfClosed' | 'othersClosed' | 'unClosed', IssueClosedDataPoint>);
      const issueCurrent = (selfClosed?.current_period_percentage ?? 0) + (othersClosed?.current_period_percentage ?? 0);
      const issueDiff = selfClosed?.percentage_change ?? 0;
      return {
        title: 'Issue Closed Ratio',
        label: formatPercentage(issueCurrent),
        value: formatDiff(issueDiff),
        isIncrease: issueDiff >= 0,
      };
    }
    case 'reviews/reviewed': {
      const { reviewed } = (data as ReviewedDataPoint[]).reduce(
        (acc, cur) => {
          if (cur.type === 'reviewed') acc.reviewed = { ...cur };
          if (cur.type === 'un-reviewed') acc.unReviewed = { ...cur };
          return acc;
        },
        {} as Record<'reviewed' | 'unReviewed', ReviewedDataPoint>
      );
      const reviewCurrent = reviewed?.current_period_percentage ?? 0;
      const reviewDiff = reviewed?.percentage_change ?? 0;
      return {
        title: 'Pull Request Reviewed Ratio',
        label: formatPercentage(reviewCurrent),
        value: formatDiff(reviewDiff),
        isIncrease: reviewDiff >= 0,
      };
    }
    case 'pull-requests/self-merged': {
      const { selfMerged } = (data as PRSelfMergedDataPoint[]).reduce(
        (acc, cur) => {
          if (cur.type === 'self-merged') acc.selfMerged = { ...cur };
          if (cur.type === 'others') acc.others = { ...cur };
          return acc;
        },
        {} as Record<'selfMerged' | 'others', PRSelfMergedDataPoint>
      );
      const prSelfMergedCurrent = selfMerged?.current_period_percentage ?? 0;
      const prSelfMergedDiff = selfMerged?.percentage_change ?? 0;
      return {
        title: 'Self Merge Rates',
        label: formatPercentage(prSelfMergedCurrent),
        value: formatDiff(prSelfMergedDiff),
        isIncrease: prSelfMergedDiff >= 0,
      };
    }
    case 'pull-requests/merged':
    default: {
      const { merged } = (data as PRMergedDataPoint[]).reduce(
        (acc, cur) => {
          if (cur.type === 'merged') acc.merged = { ...cur };
          if (cur.type === 'closed') acc.closed = { ...cur };
          if (cur.type === 'open') acc.open = { ...cur };
          return acc;
        },
        {} as Record<'merged' | 'closed' | 'open', PRMergedDataPoint>
      );
      const prCurrent = merged?.current_period_percentage ?? 0;
      const prDiff = merged?.percentage_change ?? 0;
      return {
        title: 'Pull Request Merged Ratio',
        label: formatPercentage(prCurrent),
        value: formatDiff(prDiff),
        isIncrease: prDiff >= 0,
      };
    }
  }
};

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const data = input[0] as DataPoint[];
  const activity = ctx.parameters?.activity;

  const { title, label, value, isIncrease } = handleInputData(data, activity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading title={title} subtitle=" " colorScheme="dark" style={{ height: 48, flexShrink: 0, padding: '0 24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 24px' }}>
        <div style={{ flex: '0 0 auto', display: 'flex', gap: 16 }}>
          <LabelValue
            label={label}
            value={value}
            labelProps={{
              style: {
                fontSize: ctx.runtime === 'server' ? 18 : 24,
                fontWeight: 'bold',
              },
            }}
            valueProps={{
              style: {
                fontSize: 12,
                lineHeight: 2,
                color: isIncrease
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
              },
            }}
            column={false}
            colorScheme="dark"
          />
        </div>
        <div style={{ flex: 1 }}>
          <SubChart vizModule={actionRatioViz} data={input as Input} params={ctx.parameters} linkedData={linkedData} />
        </div>
      </div>
    </div>
  );
}
