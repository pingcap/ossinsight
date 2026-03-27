import { number2percent } from '@/lib/charts-utils/utils';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as recentStatsViz from '@/charts/analyze/org/recent-stats/visualization';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type StarDataPoint = {
  idx: number;
  current_period_day: string;
  current_period_day_total: number;
  past_period_day: string;
  past_period_day_total: number;
};

type CommitDataPoint = {
  idx: number;
  day: string;
  pushes: number;
  commits: number;
};

type DataPoint = StarDataPoint | CommitDataPoint;

type TotalDataPoint = {
  current_period_total: number;
  growth_percentage: number;
  past_period_total: number;
};

type Input = [DataPoint[], TotalDataPoint[]] | [DataPoint[], undefined];

const handleData = (
  data: DataPoint[],
  total: {
    current_period_total: number;
    past_period_total: number;
    diff: number;
    diffPercentage: string;
  },
  activity: string
) => {
  switch (activity) {
    case 'commits':
      return {
        title: 'Code Submission Count Over Time',
        data: data.sort((a, b) => b.idx - a.idx),
        label: total.current_period_total,
        value:
          total.diff >= 0
            ? `↑${total.diffPercentage}`
            : `↓${total.diffPercentage}`,
        increase: total.diff >= 0,
      };
    case 'stars':
    default:
      let tmpTitle = 'Count of Star Earned Over Time';
      if (activity === 'participants') {
        tmpTitle = 'Count of Participants Over Time';
      } else if (activity === 'pull-requests') {
        tmpTitle = 'Count of Pull Request Over Time';
      }
      return {
        title: tmpTitle,
        data,
        label: total.current_period_total,
        value:
          total.diff >= 0
            ? `↑${total.diffPercentage}`
            : `↓${total.diffPercentage}`,
        increase: total.diff >= 0,
      };
  }
};

const handleTotal = (total: TotalDataPoint[] | undefined) => {
  if (!total) {
    return null;
  }
  const { current_period_total, past_period_total } =
    total?.[0] || {};

  const currentSum = current_period_total ?? 0;
  const pastSum = past_period_total ?? 0;
  const diff = currentSum - pastSum;
  const diffPercentage = number2percent(diff / (pastSum || 1));
  return {
    current_period_total,
    past_period_total,
    diff,
    diffPercentage,
  };
};

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [data, total] = input as Input;

  const { activity = 'stars' } = ctx.parameters || {};

  const totalData = handleTotal(total);

  const {
    data: handledData,
    label,
    value,
    increase,
    title,
  } = handleData(data, totalData ?? { current_period_total: 0, past_period_total: 0, diff: 0, diffPercentage: '0%' }, activity);

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
                fontSize: 24,
                fontWeight: 'bold',
              },
            }}
            valueProps={{
              style: {
                fontSize: 12,
                lineHeight: 2,
                color: increase
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
              },
            }}
            column={false}
            colorScheme="dark"
          />
        </div>
        <div style={{ flex: 1 }}>
          <SubChart vizModule={recentStatsViz} data={[handledData]} params={ctx.parameters} linkedData={linkedData} />
        </div>
      </div>
    </div>
  );
}
