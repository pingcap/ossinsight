import { number2percent } from '@/lib/charts-utils/utils';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as recentStarsViz from '@/charts/analyze/repo/recent-stars/visualization';

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

  const currentStarsSum = current_period_total ?? 0;
  const pastStarsSum = past_period_total ?? 0;
  const diff = currentStarsSum - pastStarsSum;
  const diffPercentage = number2percent(diff / (pastStarsSum || 1));

  const stars = transferData2Star(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading title="Star Earned" subtitle=" " colorScheme="dark" style={{ height: 48, flexShrink: 0, padding: '0 24px' }} />
      <div style={{ display: 'flex', flex: 1, padding: '0 24px 24px', gap: 16, minHeight: 0 }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start' }}>
          <LabelValue
            label={currentStarsSum}
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
        </div>
        <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
          <SubChart vizModule={recentStarsViz} data={[stars]} params={{ ...ctx.parameters, options: { unit: 'Star(s)' } }} linkedData={linkedData} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
}
