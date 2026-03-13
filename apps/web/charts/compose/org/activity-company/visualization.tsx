import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as companyViz from '@/charts/analyze/org/company/visualization';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type ParticipantDataPoint = {
  organization_name: string;
  participants: number;
};

type StarDataPoint = {
  organization_name: string;
  stars: number;
};

type DataPoint = ParticipantDataPoint | StarDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

const getTitle = (activity: string) => {
  switch (activity) {
    case 'stars':
      return 'Which Companies Do Those Stargazers Belong To?';
    case 'participants':
      return 'Which Companies Are Represented Among Our GitHub Participants';
    default:
      return 'Company Affiliations';
  }
};

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const activity = ctx.parameters.activity ?? 'stars';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading title={getTitle(activity)} subtitle=" " colorScheme="dark" style={{ height: 48, flexShrink: 0, padding: '0 24px' }} />
      <div style={{ display: 'flex', flex: 1, padding: '0 24px 24px' }}>
        <SubChart vizModule={companyViz} data={input} params={ctx.parameters} linkedData={linkedData} />
      </div>
    </div>
  );
}
