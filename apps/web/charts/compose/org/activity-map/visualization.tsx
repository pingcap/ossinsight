import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as activityMapViz from '@/charts/analyze/org/activity-map/visualization';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type StarDataPoint = {
  country_code: string;
  stars: number;
};

type ParticipantDataPoint = {
  country_code: string;
  participants: number;
};

type DataPoint = StarDataPoint | ParticipantDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

export type LocationData = {
  country_or_area: string;
  count: number;
};

const getTitle = (activity: string) => {
  switch (activity) {
    case 'stars':
      return 'Where Are Those Stargazers Located?';
    case 'participants':
      return 'Where Are Our GitHub Participants Based?';
    default:
      return 'Geographical Distribution';
  }
};

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const activity = ctx.parameters.activity ?? 'stars';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading title={getTitle(activity)} subtitle=" " colorScheme="dark" style={{ height: 48, flexShrink: 0, padding: '0 24px' }} />
      <div style={{ display: 'flex', flex: 1, padding: '0 24px 24px' }}>
        <SubChart vizModule={activityMapViz} data={input} params={ctx.parameters} linkedData={linkedData} />
      </div>
    </div>
  );
}
