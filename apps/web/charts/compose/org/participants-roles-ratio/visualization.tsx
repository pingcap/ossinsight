import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { Label } from '@/lib/charts-core/renderer/react/builtin/Label';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as radarChartViz from '@/charts/basic/radar-chart/visualization';

type Params = {
  owner_id: string;
  period?: string;
};

type DataPoint = {
  issue_commenters: number;
  issue_creators: number;
  participants: number;
  pr_commenters: number;
  pr_creators: number;
  pr_reviewers: number;
  commit_authors: number;
};

type Input = [DataPoint[]];

const dimensions = [
  {
    key: 'issue_commenters',
    name: 'Issue Commenters',
  },
  {
    key: 'issue_creators',
    name: 'Issue Creators',
  },
  {
    key: 'pr_commenters',
    name: 'Pull Request Commenters',
  },
  {
    key: 'pr_creators',
    name: 'Pull Request Creators',
  },
  {
    key: 'pr_reviewers',
    name: 'Pull Request Reviewers',
  },
  {
    key: 'commit_authors',
    name: 'Commit Authors',
  },
];

const normalize = (data: DataPoint) => {
  return dimensions.map(({ name, key }) => ({
    name,
    value: data[key as keyof DataPoint],
  }));
};

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [rawData] = input as Input;
  const data = rawData[0];

  const normalizedData = normalize(data);
  const radarDimensions = normalizedData.map(item => ({ name: item.name, max: data.participants }));
  const radarData = { name: '', value: normalizedData.map(i => i.value) };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: 16 }}>
      <CardHeading
        title="Which Roles Dominate Participation in This GitHub Organization?"
        subtitle=" "
        colorScheme="dark"
        style={{ height: 48, flexShrink: 0, padding: '0 24px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 24px', gap: 16 }}>
        <Label
          label="Please note: Individuals within an organization often hold multiple roles"
          colorScheme="dark"
          style={{ flex: '0.1 0 auto' }}
        />
        <div style={{ display: 'flex', flex: 1 }}>
          <SubChart vizModule={radarChartViz} data={radarData} params={{ dimensions: radarDimensions }} linkedData={linkedData} />
        </div>
      </div>
    </div>
  );
}
