import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { number2percent } from '@/lib/charts-utils/utils';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import { AvatarProgress } from '@/lib/charts-core/renderer/react/builtin/AvatarProgress';

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
    return `/analyze/${(item as ParticipantDataPoint).login}`;
  }
  if (activity === 'repos') {
    return `/analyze/${(item as ActivityDataPoint).repo_name}`;
  }
  return undefined;
}

const handleTotal = (total: TotalDataPoint[] | undefined) => {
  if (!total) {
    return null;
  }
  const { current_period_total, past_period_total } = total?.[0] || {};

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

const getToolTipContent = (activity: string) => {
  switch (activity) {
    case 'repos':
      return 'Total count of all repository activity events, including open/merge/close pull requests, and open/close issues, etc.';
    case 'participants':
    default:
      return '';
  }
};

export const type = 'react';

export default function Card({ data, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [inputData, totalData] = data as unknown as Input;
  const { activity = 'repos' } = ctx.parameters;

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
            tooltip: getToolTipContent(activity),
          }}
          column={false}
          colorScheme="dark"
        />
        {processedData && processedData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {processedData.map((item, i) => (
              <AvatarProgress
                key={i}
                label={getLabel(item)}
                imgSrc={`https://github.com/${getLogin(item)}.png`}
                size={24}
                value={(item as any)?.activities || (item as any)?.engagements}
                maxVal={maxVal}
                href={getHref(item, activity)}
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
