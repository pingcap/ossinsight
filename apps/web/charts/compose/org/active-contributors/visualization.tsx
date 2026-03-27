import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { upperFirst, number2percent } from '@/lib/charts-utils/utils';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import { AvatarLabel } from '@/lib/charts-core/renderer/react/builtin/AvatarLabel';

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

export const type = 'react';

export default function Card({ data, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [contributors, total] = data as unknown as Input;

  const totalData: Partial<TotalDataPoint> = total?.[0] ?? {};

  const growth_percentage =
    ((totalData.current_period_total ?? 0) - (totalData.past_period_total ?? 0)) /
    (totalData.past_period_total || 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading
        title={`${upperFirst(ctx.parameters?.activity)} Participants`}
        subtitle=" "
        colorScheme="dark"
        style={{ height: 48, flexShrink: 0, padding: '0 24px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 20px' }}>
        <LabelValue
          label={totalData?.current_period_total ?? 0}
          value={
            growth_percentage >= 0
              ? `↑${number2percent(growth_percentage)}`
              : `↓${number2percent(growth_percentage)}`
          }
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
                growth_percentage >= 0
                  ? ctx.theme.colors.green['400']
                  : ctx.theme.colors.red['400'],
            },
          }}
          column={false}
          colorScheme="dark"
        />
        {contributors && contributors.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: '1fr',
              gap: 4,
            }}
          >
            {contributors.slice(0, 5).map((item, i) => (
              <AvatarLabel
                key={i}
                label=""
                imgSize={40}
                imgSrc={item.login ? `https://github.com/${item.login}.png` : ''}
                href={item.login ? `/analyze/${item.login}` : ''}
                colorScheme="dark"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
