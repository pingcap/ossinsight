/** @jsxImportSource @/lib/compose */
import { Card, JSX, builtin } from '@/lib/compose';

import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

type Params = {
  repo_id: string;
  activity?: string;
};

type DataPoint = {
  issue_closed_ratio: number;
  pr_merged_ratio: number;
  pr_reviewed_ratio: number;
};

type Input = [DataPoint[]];

export default function (
  [input]: Input,
  ctx: WidgetVisualizerContext<Params>,
): JSX.Element {
  const today = new Date();
  const prior30 = new Date(new Date().setDate(today.getDate() - 30));
  const end = DateTime.fromISO(today.toISOString());
  const start = DateTime.fromISO(prior30.toISOString());
  const subtitle = `${start.toFormat('MM-dd')} - ${end.toFormat('MM-dd')}`;

  const SPACING = 16;
  const HORIZONTAL_SPACING = 16;

  function Item ({ label, data, params }: { label: string, params: Params, data: any }) {
    return (
      <flex direction="vertical" gap={SPACING}>
        <builtin.Label label={label} grow={0.1} />
        <widget widget="@ossinsight/widget-analyze-repo-recent-collaborative-productivity-metrics" data={[data]} parameters={params} grow={0.9} />
      </flex>
    );
  }

  const items = [
    { label: 'Pull Request Merged Ratio', activity: 'pr-merged-ratio' },
    { label: 'Issue Closed Ratio', activity: 'issue-closed-ratio' },
    { label: 'Pull Request  Reviewed Ratio', activity: 'pr-reviewed-ratio' },
  ];

  return (
    <Card padding={[0, Card.COMMON_PADDING, Card.COMMON_PADDING]} title='Collaborative Productivity' subtitle={`Date: ${subtitle}`}>
      <flex direction="horizontal" gap={HORIZONTAL_SPACING}>
        {items.map(({ label, activity }) => (
          <Item label={label} data={input} params={{ ...ctx.parameters, activity }} />
        ))}
      </flex>
    </Card>
  );
}

export const type = 'compose';
export const width = 325 * 1.5;
export const height = 130 * 1.5;
