import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import { AvatarProgress } from '@/lib/charts-core/renderer/react/builtin/AvatarProgress';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type StarDataPoint = {
  repo_id: number;
  repo_name: string;
  stars: number;
};

type TotalDataPoint = {
  current_period_total: number;
  past_period_total: number;
  growth_percentage: number;
};

type DataPoint = StarDataPoint;

type Input = [DataPoint[], TotalDataPoint[]];

const handleInputData = (data: DataPoint[], activity: string) => {
  switch (activity) {
    case 'stars':
    default:
      return {
        data: data.slice(0, 5),
        title: 'Top Repos',
        subtitle: ' ',
        label: 'Repo',
        value: 'Star earned',
        maxVal: data.reduce((acc, cur) => acc + cur.stars, 0),
      };
  }
};

export const type = 'react';

export default function Card({ data, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [inputData] = data as unknown as Input;
  const { activity = 'activities' } = ctx.parameters;

  const { title, subtitle, label, value, data: processedData, maxVal } = handleInputData(
    inputData,
    activity
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading
        title={title}
        subtitle={subtitle}
        colorScheme="dark"
        style={{ height: 48, flexShrink: 0, padding: '0 24px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 20px' }}>
        <LabelValue
          label={label}
          value={value}
          labelProps={{
            style: {
              fontSize: 12,
              fontWeight: 'normal',
            },
          }}
          valueProps={{
            style: {
              fontSize: 12,
              fontWeight: 'normal',
              marginLeft: 'auto',
            },
          }}
          column={false}
          colorScheme="dark"
        />
        {processedData && processedData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {processedData.map((item, i) => (
              <AvatarProgress
                key={i}
                label={item.repo_name.split('/')[1]}
                imgSrc={`https://github.com/${item.repo_name.split('/')[0]}.png`}
                size={24}
                value={item?.stars}
                maxVal={maxVal}
                href={`/analyze/${item.repo_name}`}
                colorScheme="dark"
                style={{ flex: 1 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
