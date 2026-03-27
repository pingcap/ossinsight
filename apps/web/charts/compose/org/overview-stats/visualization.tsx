import { upperFirst, number2percent } from '@/lib/charts-utils/utils';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as recentStarsViz from '@/charts/analyze/repo/recent-stars/visualization';

type Params = {
  owner_id: string;
  activity?: string;
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

const parseTitle = (activity: string, isTooltip?: boolean) => {
  switch (activity) {
    case 'issues':
      return isTooltip ? 'Issue(s)' : 'Issues';
    case 'pull-requests':
      return isTooltip ? 'Pull Request(s)' : 'Pull Requests';
    case 'reviews':
      return isTooltip ? 'Review(s)' : 'Reviews';
    default:
      return upperFirst(activity);
  }
};

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

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [data, total] = input as Input;

  const { current_period_total, past_period_total } = total?.[0] ?? {};

  const currentSum = current_period_total ?? 0;
  const pastSum = past_period_total ?? 0;
  const diff = currentSum - pastSum;
  const diffPercentage = number2percent(diff / (pastSum || 1));

  const stars = transferData2Star(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading title={parseTitle(ctx.parameters?.activity)} subtitle=" " colorScheme="dark" style={{ height: 48, flexShrink: 0, padding: '0 24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 24px' }}>
        <LabelValue
          label={currentSum}
          value={diff >= 0 ? `↑${diffPercentage}` : `↓${diffPercentage}`}
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
              color:
                diff >= 0
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
            },
          }}
          column={false}
          colorScheme="dark"
        />
        <div style={{ flex: 1 }}>
          <SubChart
            vizModule={recentStarsViz}
            data={[stars]}
            params={{
              ...ctx.parameters,
              options: {
                unit: parseTitle(ctx.parameters?.activity, true),
              },
            }}
            linkedData={linkedData}
          />
        </div>
      </div>
    </div>
  );
}
