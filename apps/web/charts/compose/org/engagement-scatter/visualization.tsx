import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as engagementScatterViz from '@/charts/analyze/org/engagement-scatter/visualization';

type Params = {
  hideData?: boolean;
  owner_id: string;
  activity?: string;
};

type DataPoint = {
  repos: number;
  engagements: number;
  participants: number;
  participant_logins: string;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading
        title="Who's the Most Engaged in This GitHub Organization?"
        subtitle=" "
        colorScheme="dark"
        style={{ height: 48, flexShrink: 0, padding: '0 24px' }}
      />
      <div style={{ display: 'flex', flex: 1, padding: '0 24px 24px' }}>
        <SubChart vizModule={engagementScatterViz} data={input} params={ctx.parameters} linkedData={linkedData} />
      </div>
    </div>
  );
}
