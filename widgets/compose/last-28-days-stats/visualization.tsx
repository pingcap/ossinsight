/** @jsxImportSource @/lib/compose */
import { Card, JSX, Widget, WidgetProps, builtin } from '@/lib/compose';

import { WidgetsDefinitions } from '@ossinsight/internal/widgets';
import type { WidgetVisualizerContext } from '@ossinsight/widgets-types';
import { DateTime } from 'luxon';

type Params = {
  repo_id: string
}

type Input = [[any[]], [any[]], [any[]], [any[]]]

export default function ([[issues], [prs], [contributors], [stars]]: Input, ctx: WidgetVisualizerContext<Params>): JSX.Element {
  const end = DateTime.fromISO(issues[0].current_period_day);
  const start = DateTime.fromISO(issues[issues.length - 1].current_period_day);
  const subtitle = `${start.toFormat('MM-dd')} - ${end.toFormat('MM-dd')}`;

  const SPACING = 16;
  const HORIZONTAL_SPACING = 64;

  function Item<K extends keyof WidgetsDefinitions> ({ label, valueKey, data, ...props }: { label: string, valueKey: string } & Omit<WidgetProps<K>, 'parameters'>) {
    return (
      <flex direction="horizontal" gap={SPACING}>
        <builtin.LabelValue label={label} value={data[0][valueKey]} grow={0.3} />
        <Widget name={props.name} parameters={ctx.parameters} data={[data]} grow={0.7} />
      </flex>
    );
  }

  return (
    <Card padding={[0, Card.COMMON_PADDING, Card.COMMON_PADDING]} title="Last 28 Days Stats" subtitle={`Date: ${subtitle}`} gap={SPACING}>
      <flex direction="horizontal" gap={HORIZONTAL_SPACING}>
        <Item name="@ossinsight/widget-analyze-repo-recent-stars" label="Stars earned" valueKey="current_period_stars" data={stars} />
        <Item name="@ossinsight/widget-analyze-repo-recent-pull-requests" label="PRs created" valueKey="current_period_opened_prs" data={prs} />
      </flex>
      <flex direction="horizontal" gap={HORIZONTAL_SPACING}>
        <Item name="@ossinsight/widget-analyze-repo-recent-contributors" label="Contributors" valueKey="current_period_contributors" data={contributors} />
        <Item name="@ossinsight/widget-analyze-repo-recent-issues" label="Issues opened" valueKey="current_period_opened_issues" data={issues} />
      </flex>
    </Card>
  );
}

export const type = 'compose';

export const width = 436 * 1.5;
export const height = 132 * 1.5;
