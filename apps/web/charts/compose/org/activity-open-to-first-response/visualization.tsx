import { prettyMs } from '@/lib/charts-utils/utils';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import SubChart from '@/components/Analyze/Section/SubChart';
import * as openToCloseViz from '@/charts/analyze/org/activity-open-to-close/visualization';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type DataPoint = {
  repo_id: number;
  repo_name: string;
  p0: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
};

type MediumDataPoint = {
  current_period_medium: number;
  past_period_medium: number;
  percentage: number;
};

type Input = [DataPoint[], MediumDataPoint[]];

const fmtHours = (hours: number) =>
  prettyMs.default(hours * 60 * 60 * 1000, { unitCount: 1 });

const getTitle = (activity: string) => {
  switch (activity) {
    case 'issues':
      return 'Which Repository Exhibit Exceptional Efficiency in Addressing Issues?';
    case 'pull-requests':
      return 'Which Repository Achieves the Shortest Pull Request Completion Time?';
    default:
      return 'Top Repos of Open to Close Time';
  }
};

export const type = 'react';

export default function Card({ data: input, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [rawInput, mediumInput] = input as Input;

  const activity = ctx.parameters.activity ?? 'pull-requests';

  const mediumData = mediumInput[0];
  const { current_period_medium, percentage } = mediumData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading title={getTitle(activity)} subtitle=" " colorScheme="dark" style={{ height: 48, flexShrink: 0, padding: '0 24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 24px' }}>
        <div style={{ flex: '0 0 auto' }}>
          <LabelValue
            label={fmtHours(current_period_medium)}
            value={percentage >= 0 ? `↑${(percentage * 100).toFixed(2)}%` : `↓${(percentage * 100).toFixed(2)}%`}
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
                  percentage >= 0
                    ? ctx.theme.colors.green['400']
                    : ctx.theme.colors.red['400'],
              },
            }}
            column={false}
            colorScheme="dark"
            tooltip="Medium time"
          />
        </div>
        <div style={{ flex: 1 }}>
          <SubChart vizModule={openToCloseViz} data={[rawInput]} params={ctx.parameters} linkedData={linkedData} />
        </div>
      </div>
    </div>
  );
}
